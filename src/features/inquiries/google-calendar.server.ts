import "server-only";

interface GoogleCalendarEventInput {
  attendeeEmail: string;
  attendeeName: string;
  description: string;
  end: Date;
  relatedTitle: string | null;
  start: Date;
}

interface GoogleCalendarEventResponse {
  conferenceData?: {
    entryPoints?: Array<{ entryPointType?: string; uri?: string }>;
  };
  hangoutLink?: string;
  id?: string;
}

interface GoogleCalendarMeeting {
  id: string;
  meetUrl: string | null;
}

const CALENDAR_API_URL = "https://www.googleapis.com/calendar/v3";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";

function getGoogleCalendarConfig() {
  const clientId = process.env.GOOGLE_CALENDAR_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CALENDAR_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_CALENDAR_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error("Falta configurar la integración de Google Calendar en el servidor.");
  }

  return {
    calendarId: process.env.GOOGLE_CALENDAR_ID || "primary",
    clientId,
    clientSecret,
    refreshToken,
    timeZone: process.env.GOOGLE_CALENDAR_TIME_ZONE || "America/Montevideo",
  };
}

async function getAccessToken() {
  const config = getGoogleCalendarConfig();
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      grant_type: "refresh_token",
      refresh_token: config.refreshToken,
    }),
    cache: "no-store",
  });
  const payload = (await response.json().catch(() => null)) as { access_token?: string } | null;

  if (!response.ok || !payload?.access_token) {
    throw new Error("Google no pudo renovar el acceso al calendario.");
  }

  return payload.access_token;
}

function getMeetUrl(event: GoogleCalendarEventResponse) {
  return event.hangoutLink ?? event.conferenceData?.entryPoints?.find(
    (entryPoint) => entryPoint.entryPointType === "video",
  )?.uri ?? null;
}

async function requestGoogleCalendar<T>(
  path: string,
  init: RequestInit,
): Promise<T> {
  const accessToken = await getAccessToken();
  const response = await fetch(`${CALENDAR_API_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...init.headers,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const error = new Error("Google Calendar rechazó la operación.") as Error & {
      status?: number;
    };
    error.status = response.status;
    throw error;
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

function createEventPayload(input: GoogleCalendarEventInput, includeConference: boolean) {
  const { timeZone } = getGoogleCalendarConfig();

  return {
    summary: `Reunión con ${input.attendeeName}`,
    description: [
      input.relatedTitle ? `Consulta: ${input.relatedTitle}` : "Consulta web",
      "",
      input.description,
    ].join("\n"),
    start: { dateTime: input.start.toISOString(), timeZone },
    end: { dateTime: input.end.toISOString(), timeZone },
    attendees: [{ displayName: input.attendeeName, email: input.attendeeEmail }],
    ...(includeConference
      ? {
          conferenceData: {
            createRequest: {
              conferenceSolutionKey: { type: "hangoutsMeet" },
              requestId: crypto.randomUUID(),
            },
          },
        }
      : {}),
  };
}

function calendarEventPath(eventId?: string) {
  const calendarId = encodeURIComponent(getGoogleCalendarConfig().calendarId);
  const base = `/calendars/${calendarId}/events`;
  return eventId ? `${base}/${encodeURIComponent(eventId)}` : base;
}

function toMeeting(event: GoogleCalendarEventResponse): GoogleCalendarMeeting {
  if (!event.id) {
    throw new Error("Google Calendar no devolvió el identificador del evento.");
  }

  return { id: event.id, meetUrl: getMeetUrl(event) };
}

function waitForConference() {
  return new Promise((resolve) => {
    setTimeout(resolve, 500);
  });
}

async function waitForMeetUrl(meeting: GoogleCalendarMeeting) {
  let currentMeeting = meeting;

  for (let attempt = 0; !currentMeeting.meetUrl && attempt < 8; attempt += 1) {
    await waitForConference();
    const event = await requestGoogleCalendar<GoogleCalendarEventResponse>(
      calendarEventPath(currentMeeting.id),
      { method: "GET" },
    );
    currentMeeting = toMeeting(event);
  }

  if (!currentMeeting.meetUrl) {
    await cancelGoogleCalendarEvent(currentMeeting.id);
    throw new Error("Google Calendar no generó el enlace de Meet. Intentá nuevamente.");
  }

  return currentMeeting;
}

export async function createGoogleCalendarEvent(input: GoogleCalendarEventInput) {
  const event = await requestGoogleCalendar<GoogleCalendarEventResponse>(
    `${calendarEventPath()}?conferenceDataVersion=1&sendUpdates=all`,
    { method: "POST", body: JSON.stringify(createEventPayload(input, true)) },
  );

  return waitForMeetUrl(toMeeting(event));
}

export async function updateGoogleCalendarEvent(
  eventId: string,
  input: GoogleCalendarEventInput,
) {
  const event = await requestGoogleCalendar<GoogleCalendarEventResponse>(
    `${calendarEventPath(eventId)}?conferenceDataVersion=1&sendUpdates=all`,
    { method: "PATCH", body: JSON.stringify(createEventPayload(input, false)) },
  );

  return toMeeting(event);
}

export async function cancelGoogleCalendarEvent(eventId: string) {
  try {
    await requestGoogleCalendar<void>(
      `${calendarEventPath(eventId)}?sendUpdates=all`,
      { method: "DELETE" },
    );
  } catch (error) {
    if (error instanceof Error && "status" in error && error.status === 404) {
      return;
    }
    throw error;
  }
}
