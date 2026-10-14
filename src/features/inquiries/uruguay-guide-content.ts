import type { PublicLocale } from "@/i18n/public/config";
import type {
  UruguayGuideFaq,
  UruguayGuidePageContent,
  UruguayGuideSection,
} from "@/features/inquiries/uruguay-guide-page";

type GuideCopy = {
  residents: UruguayGuidePageContent;
  nonResidents: UruguayGuidePageContent;
};

const residentsSectionsEs: UruguayGuideSection[] = [
  {
    title: "1. Documentación del comprador y origen de los fondos",
    paragraphs: [
      "El escribano solicitará la documentación necesaria para identificar al comprador y entender la operación.",
    ],
    bullets: [
      "Cédula de identidad vigente, domicilio, ocupación y estado civil.",
      "Si corresponde, datos del cónyuge y documentación de matrimonio, divorcio, viudez o separación de bienes.",
      "Declaración e información respaldatoria del origen de los fondos, según la operación y la evaluación de riesgo.",
      "Recibos de sueldo o pasividad, estados de cuenta, declaraciones fiscales, certificación de ingresos u otros documentos que expliquen la procedencia del dinero y su recorrido bancario.",
      "Si firma un apoderado, poder suficiente revisado previamente por el escribano.",
    ],
    callout: "La documentación concreta puede variar según el comprador, la operación y los controles legales aplicables.",
  },
  {
    title: "2. Revisión jurídica y técnica del inmueble",
    paragraphs: [
      "Antes de asumir compromisos conviene designar un escribano de confianza. El profesional estudia los títulos y antecedentes, los certificados registrales, la titularidad, los gravámenes y embargos, el padrón, los planos, la situación catastral, los tributos y la regularidad de las construcciones, incluidos los controles ante BPS cuando correspondan.",
      "En apartamentos, también es importante solicitar el reglamento de copropiedad, el certificado de gastos comunes, las deudas y las obras extraordinarias previstas. Hay que confirmar quién ocupa la unidad, las condiciones de entrega y, si está alquilada, el contrato vigente.",
      "La reserva o promesa debe indicar precio, moneda, pagos, plazos, condiciones, entrega y consecuencias del incumplimiento. Si la compra depende de un préstamo, la condición de aprobación bancaria debe quedar expresamente contemplada.",
    ],
  },
  {
    title: "3. Compra con financiación",
    paragraphs: [
      "El banco evalúa ingresos, antigüedad y estabilidad laboral, edad, endeudamiento, antecedentes crediticios, ahorro disponible y tasación de la propiedad. Puede solicitar comprobantes según el perfil del solicitante y la documentación del inmueble.",
      "La residencia no garantiza la aprobación del crédito. Antes de comprometer pagos conviene confirmar la aprobación, los plazos, la tasa y los costos de tasación, hipoteca, seguros y comisiones.",
    ],
  },
  {
    title: "4. Impuestos y gastos de compraventa",
    paragraphs: ["Es importante separar el precio del inmueble de los gastos necesarios para concretar la operación."],
    table: {
      headers: ["Concepto", "Base y valor orientativo"],
      rows: [
        ["ITP del comprador", "2% del valor real catastral actualizado por IPC. No se calcula sobre el precio de mercado; el escribano determina el importe en pesos y liquida el tributo."],
        ["Honorarios de escribano", "Referencia general: 3% más IVA del 22% sobre los honorarios, equivalente a 3,66% de la base. La base, mínimos, regímenes especiales y actos previos pueden modificar el cálculo."],
        ["Comisión inmobiliaria", "Según lo acordado. Para presupuestar se puede usar un supuesto de 3% del precio más IVA del 22%, total 3,66%. No es un impuesto y debe confirmarse por escrito."],
        ["Certificados, registro y otros", "Importes variables: certificados, tasas registrales, timbres, aportes y gestiones. Verificar qué está incluido en el presupuesto notarial."],
        ["Financiación", "Gastos de tasación, hipoteca, seguros y comisiones según el banco. Se agregan a los gastos de compraventa."],
        ["Obra nueva", "Confirmar si el precio incluye el IVA aplicable. Gastos de ocupación, conexiones, reglamento u otros pueden cobrarse aparte según el contrato."],
      ],
    },
  },
  {
    title: "5. Ejemplo ilustrativo: precio de USD 100.000",
    paragraphs: ["Supuestos: compra al contado, inmueble usado, base de honorarios notariales de USD 100.000, comisión inmobiliaria acordada de 3% y valor real catastral actualizado equivalente a USD 40.000 únicamente para facilitar el ejemplo."],
    table: {
      headers: ["Concepto", "Importe"],
      rows: [
        ["ITP: 2% de USD 40.000", "USD 800"],
        ["Escribano: USD 3.000 + IVA USD 660", "USD 3.660"],
        ["Inmobiliaria: USD 3.000 + IVA USD 660", "USD 3.660"],
        ["Subtotal de gastos del ejemplo", "USD 8.120"],
        ["Precio + subtotal", "USD 108.120"],
      ],
    },
    callout: "Faltan sumar certificados, tasas, aportes y otros desembolsos presupuestados. No incluye financiación, conexiones ni obras. El equivalente en dólares del ITP depende del tipo de cambio; su cálculo y liquidación se realizan en pesos. El ejemplo no constituye una cotización.",
  },
  {
    title: "6. Costos posteriores a la compra",
    paragraphs: [
      "La Contribución Inmobiliaria y los tributos departamentales dependen del departamento, padrón, valor imponible y eventuales beneficios. No hay un porcentaje único nacional sobre el precio de compra; conviene solicitar las últimas facturas y una estimación anual.",
      "El Impuesto de Primaria es un tributo anual sujeto al valor imponible y a las exoneraciones. El nuevo adquirente es contribuyente desde el 1 de enero del año siguiente a la compra; el impuesto del año de adquisición corresponde al enajenante, sin perjuicio de los ajustes contractuales que revise el escribano.",
      "También deben considerarse gastos comunes, fondo de reserva, obras extraordinarias, seguros, mantenimiento, saneamiento y consumos, acordando la fecha de corte y la distribución de gastos en la entrega.",
      "El Impuesto al Patrimonio puede corresponder según el patrimonio fiscal total, mínimos y reglas aplicables. Si se alquila el inmueble, los ingresos tienen su propio tratamiento tributario; estos conceptos no son impuestos automáticos de compra.",
    ],
  },
  {
    title: "7. Recomendaciones antes de reservar",
    bullets: [
      "Definir el presupuesto total: precio, impuestos, honorarios y otros gastos.",
      "Entregar al escribano los datos personales y el respaldo del origen de fondos.",
      "Obtener presupuesto notarial y comisión inmobiliaria por escrito.",
      "Solicitar cédula catastral, facturas de tributos y gastos comunes.",
      "Revisar la situación jurídica, construcción, ocupación y condiciones de entrega.",
      "Si hay crédito, confirmar aprobación y costos antes de comprometer pagos.",
      "En obra nueva, confirmar precio final, conexiones, ocupación y cronograma.",
    ],
  },
];

const residentsSectionsEn = translateSections(residentsSectionsEs, {
  title: ["1. Buyer documentation and source of funds", "2. Legal and technical review of the property", "3. Buying with financing", "4. Purchase taxes and costs", "5. Illustrative example: USD 100,000 price", "6. Costs after purchase", "7. Recommendations before reserving"],
  paragraphs: [
    ["The notary will request the documentation needed to identify the buyer and understand the transaction."],
    ["Before making commitments, it is advisable to appoint a trusted notary. The professional reviews title deeds and history, registry certificates, ownership, liens and attachments, cadastral information, plans, taxes, and the regularity of construction, including BPS checks when applicable.", "For apartments, it is also important to request the co-ownership regulations, common-expense certificate, debts, and planned extraordinary works. Confirm who occupies the unit, delivery conditions, and, if rented, the current lease.", "The reservation or promise should state price, currency, payments, deadlines, conditions, delivery, and consequences of breach. If the purchase depends on a loan, the bank-approval condition should be expressly included."],
    ["The bank evaluates income, employment seniority and stability, age, indebtedness, credit history, available savings, and the property appraisal. It may request supporting documents according to the applicant’s profile and the property documentation.", "Residence does not guarantee loan approval. Before committing payments, confirm approval, terms, rate, and appraisal, mortgage, insurance, and commission costs."],
    ["It is important to separate the property price from the costs required to complete the transaction."],
    ["Assumptions: cash purchase, used property, notarial-fee base of USD 100,000, agreed real-estate commission of 3%, and an updated cadastral real value equivalent to USD 40,000 solely to facilitate the example."],
    ["Real-estate and departmental taxes depend on the department, cadastral record, taxable value, and any applicable benefits. There is no single national percentage of the purchase price; request recent bills and an annual estimate.", "Primary Tax is an annual tax subject to taxable value and exemptions. The new owner becomes liable from January 1 of the year after purchase; the tax for the acquisition year belongs to the seller, subject to contractual adjustments reviewed by the notary.", "Also consider common expenses, reserve funds, extraordinary works, insurance, maintenance, sanitation, and consumption, agreeing on the cut-off date and allocation at delivery.", "Wealth Tax may apply depending on total fiscal assets, thresholds, and applicable rules. If the property is rented, the income has its own tax treatment; these are not automatic purchase taxes."],
    ["Define the total budget: price, taxes, fees, and other costs.", "Give the notary personal details and proof of source of funds.", "Obtain the notarial budget and real-estate commission in writing.", "Request cadastral information, tax bills, and common-expense bills.", "Review the legal situation, construction, occupancy, and delivery conditions.", "If there is credit, confirm approval and costs before committing payments.", "For new construction, confirm final price, connections, occupancy, and schedule."],
  ],
  bullets: [
    ["Valid national ID, address, occupation, and marital status.", "If applicable, spouse details and marriage, divorce, widowhood, or separation-of-assets documents.", "Declaration and supporting information for source of funds, according to the transaction and risk assessment.", "Payslips or pension statements, account statements, tax returns, proof of income, or other documents explaining the origin and banking trail of the money.", "If signing through an attorney, sufficient power of attorney previously reviewed by the notary."],
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    ["Define the total budget: price, taxes, fees, and other costs.", "Give the notary personal details and proof of source of funds.", "Obtain the notarial budget and real-estate commission in writing.", "Request cadastral information, tax bills, and common-expense bills.", "Review the legal situation, construction, occupancy, and delivery conditions.", "If there is credit, confirm approval and costs before committing payments.", "For new construction, confirm final price, connections, occupancy, and schedule."],
  ],
  callout: ["The specific documentation may vary according to the buyer, the transaction, and the applicable legal controls.", undefined, undefined, undefined, "The example excludes certificates, fees, contributions, and other budgeted disbursements. It excludes financing, connections, and works. The dollar equivalent of ITP depends on the exchange rate; it is calculated and settled in pesos. The example is not a quotation.", undefined, undefined],
  table: [
    undefined,
    undefined,
    undefined,
    { headers: ["Item", "Indicative basis and value"], rows: [["Buyer’s ITP", "2% of the updated cadastral real value by CPI. It is not calculated on market price; the notary determines the amount in pesos and settles the tax."], ["Notary fees", "General reference: 3% plus 22% VAT on the fees, equivalent to 3.66% of the base. The base, minimums, special regimes, and prior acts may change the calculation."], ["Real-estate commission", "As agreed. For budgeting, a 3% price assumption plus 22% VAT may be used, totaling 3.66%. It is not a tax and must be confirmed in writing."], ["Certificates, registry, and other items", "Variable amounts: certificates, registry fees, stamps, contributions, and procedures. Verify what is included in the notarial budget."], ["Financing", "Appraisal, mortgage, insurance, and commission costs according to the bank. They are added to the purchase costs."], ["New construction", "Confirm whether the price includes applicable VAT. Occupancy costs, connections, regulations, or other items may be charged separately under the contract."]]},
    { headers: ["Item", "Amount"], rows: [["ITP: 2% of USD 40,000", "USD 800"], ["Notary: USD 3,000 + USD 660 VAT", "USD 3,660"], ["Real estate: USD 3,000 + USD 660 VAT", "USD 3,660"], ["Example cost subtotal", "USD 8,120"], ["Price + subtotal", "USD 108,120"]]},
    undefined,
    undefined,
    undefined,
  ],
});

const residentsSectionsDe = translateSections(residentsSectionsEs, {
  title: ["1. Unterlagen des Käufers und Herkunft der Mittel", "2. Rechtliche und technische Prüfung der Immobilie", "3. Kauf mit Finanzierung", "4. Steuern und Kosten des Immobilienkaufs", "5. Beispiel: Kaufpreis USD 100.000", "6. Kosten nach dem Kauf", "7. Empfehlungen vor der Reservierung"],
  paragraphs: [
    ["Der Notar fordert die Unterlagen an, die zur Identifizierung des Käufers und zum Verständnis des Vorgangs erforderlich sind."],
    ["Vor einer Verpflichtung sollte ein Notar des Vertrauens bestimmt werden. Er prüft Eigentumstitel und Vorgeschichte, Registerbescheinigungen, Eigentum, Belastungen und Pfändungen, Katasterdaten, Pläne, Steuern und die bauliche Ordnungsmäßigkeit, einschließlich BPS-Prüfungen, sofern erforderlich.", "Bei Wohnungen sollten außerdem die Miteigentumsordnung, die Bescheinigung über Gemeinschaftskosten, Schulden und geplante Sonderarbeiten angefordert werden. Zu bestätigen sind die Nutzung der Einheit, die Übergabebedingungen und bei Vermietung der aktuelle Vertrag.", "Die Reservierung oder das Kaufversprechen sollte Preis, Währung, Zahlungen, Fristen, Bedingungen, Übergabe und Folgen einer Nichterfüllung festhalten. Wenn der Kauf von einem Darlehen abhängt, sollte die Bankgenehmigung ausdrücklich als Bedingung aufgenommen werden."],
    ["Die Bank bewertet Einkommen, Beschäftigungsdauer und -stabilität, Alter, Verschuldung, Kredithistorie, verfügbares Sparguthaben und die Bewertung der Immobilie. Je nach Profil und Unterlagen können Nachweise verlangt werden.", "Der Wohnsitz garantiert keine Kreditzusage. Vor Zahlungen sollten Genehmigung, Fristen, Zinssatz sowie Kosten für Bewertung, Hypothek, Versicherungen und Provisionen bestätigt werden."],
    ["Es ist wichtig, den Immobilienpreis von den Kosten für den Abschluss des Vorgangs zu trennen."],
    ["Annahmen: Barkauf, gebrauchte Immobilie, Berechnungsgrundlage für Notargebühren USD 100.000, vereinbarte Immobilienprovision von 3% und ein aktualisierter Katasterwert von USD 40.000 ausschließlich zur Veranschaulichung."],
    ["Immobilien- und Gemeindesteuern hängen von Gemeinde, Katastereintrag, steuerlichem Wert und möglichen Vergünstigungen ab. Es gibt keinen einheitlichen nationalen Prozentsatz auf den Kaufpreis; aktuelle Rechnungen und eine Jahresschätzung sollten angefordert werden.", "Die Grundschulsteuer ist eine jährliche Steuer auf Grundlage des steuerlichen Werts und möglicher Befreiungen. Der neue Eigentümer ist ab dem 1. Januar des Jahres nach dem Kauf steuerpflichtig; die Steuer des Erwerbsjahres gehört dem Veräußerer, vorbehaltlich vertraglicher Anpassungen durch den Notar.", "Zu berücksichtigen sind auch Gemeinschaftskosten, Rücklagen, Sonderarbeiten, Versicherungen, Instandhaltung, Abwasser und Verbrauchskosten. Stichtag und Aufteilung sollten bei der Übergabe vereinbart werden.", "Die Vermögensteuer kann je nach Gesamtvermögen, Mindestbeträgen und geltenden Regeln anfallen. Bei Vermietung unterliegen die Einnahmen einer eigenen steuerlichen Behandlung; dies sind keine automatischen Kaufsteuern."],
    ["Gesamtbudget festlegen: Preis, Steuern, Gebühren und weitere Kosten.", "Dem Notar persönliche Daten und Nachweise zur Herkunft der Mittel übergeben.", "Notar- und Immobilienprovision schriftlich budgetieren lassen.", "Katasterunterlagen, Steuerrechnungen und Gemeinschaftskosten anfordern.", "Rechtliche Situation, Bau, Nutzung und Übergabebedingungen prüfen.", "Bei Kredit Genehmigung und Kosten vor Zahlungsverpflichtungen bestätigen.", "Bei Neubau Endpreis, Anschlüsse, Übergabe und Zeitplan bestätigen."],
  ],
  bullets: [
    ["Gültiger Personalausweis, Anschrift, Beruf und Familienstand.", "Gegebenenfalls Angaben zum Ehepartner und Unterlagen zu Ehe, Scheidung, Verwitwung oder Gütertrennung.", "Erklärung und Nachweise zur Herkunft der Mittel entsprechend Vorgang und Risikoprüfung.", "Gehalts- oder Pensionsnachweise, Kontoauszüge, Steuererklärungen, Einkommensbescheinigungen oder andere Unterlagen zur Herkunft und zum Bankweg des Geldes.", "Bei Vertretung durch einen Bevollmächtigten eine vom Notar vorab geprüfte ausreichende Vollmacht."],
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    ["Gesamtbudget festlegen: Preis, Steuern, Gebühren und weitere Kosten.", "Dem Notar persönliche Daten und Nachweise zur Herkunft der Mittel übergeben.", "Notar- und Immobilienprovision schriftlich budgetieren lassen.", "Katasterunterlagen, Steuerrechnungen und Gemeinschaftskosten anfordern.", "Rechtliche Situation, Bau, Nutzung und Übergabebedingungen prüfen.", "Bei Kredit Genehmigung und Kosten vor Zahlungsverpflichtungen bestätigen.", "Bei Neubau Endpreis, Anschlüsse, Übergabe und Zeitplan bestätigen."],
  ],
  callout: ["Die konkreten Unterlagen können je nach Käufer, Vorgang und geltenden rechtlichen Kontrollen variieren.", undefined, undefined, undefined, "Nicht enthalten sind Bescheinigungen, Gebühren, Beiträge und weitere budgetierte Auszahlungen. Finanzierung, Anschlüsse und Bauarbeiten sind nicht enthalten. Der Dollar-Gegenwert der ITP hängt vom Wechselkurs ab; Berechnung und Zahlung erfolgen in Pesos. Das Beispiel ist kein Angebot.", undefined, undefined],
  table: [
    undefined,
    undefined,
    undefined,
    { headers: ["Konzept", "Orientierungsgrundlage und Wert"], rows: [["ITP des Käufers", "2% des mit IPC aktualisierten realen Katasterwerts. Nicht auf den Marktpreis berechnet; der Notar bestimmt den Betrag in Pesos und führt die Abrechnung durch."], ["Notargebühren", "Allgemeine Referenz: 3% plus 22% IVA auf die Gebühren, entsprechend 3,66% der Grundlage. Grundlage, Mindestbeträge, Sonderregelungen und frühere Vorgänge können die Berechnung ändern."], ["Immobilienprovision", "Nach Vereinbarung. Für das Budget kann man 3% des Preises plus 22% IVA, insgesamt 3,66%, annehmen. Sie ist keine Steuer und muss schriftlich bestätigt werden."], ["Bescheinigungen, Register und Sonstiges", "Variable Beträge: Bescheinigungen, Registergebühren, Stempel, Beiträge und Bearbeitung. Prüfen, was im Notarbudget enthalten ist."], ["Finanzierung", "Kosten für Bewertung, Hypothek, Versicherungen und Provisionen je nach Bank. Sie kommen zu den Kaufkosten hinzu."], ["Neubau", "Prüfen, ob der Preis die geltende IVA enthält. Übergabe, Anschlüsse, Ordnung oder andere Kosten können laut Vertrag zusätzlich berechnet werden."]]},
    { headers: ["Konzept", "Betrag"], rows: [["ITP: 2% von USD 40.000", "USD 800"], ["Notar: USD 3.000 + USD 660 IVA", "USD 3.660"], ["Immobilienagentur: USD 3.000 + USD 660 IVA", "USD 3.660"], ["Zwischensumme Beispielkosten", "USD 8.120"], ["Preis + Zwischensumme", "USD 108.120"]]},
    undefined,
    undefined,
    undefined,
  ],
});

const nonResidentsSectionsEs: UruguayGuideSection[] = [
  { title: "1. Comprar sin residencia en Uruguay", paragraphs: ["No es necesario tener residencia legal ni fiscal uruguaya para adquirir un inmueble. En términos generales, los extranjeros pueden adquirir propiedades urbanas, utilizarlas, alquilarlas y venderlas de acuerdo con la legislación vigente.", "La compra de una propiedad no otorga automáticamente residencia legal o fiscal. La situación migratoria y fiscal debe analizarse por separado."], callout: "La posibilidad de comprar no elimina la necesidad de cumplir con controles legales, bancarios y tributarios." },
  { title: "2. Requisitos y documentación", paragraphs: ["El comprador deberá presentar la documentación personal y la información necesaria para la operación y para acreditar el origen lícito de los fondos."], bullets: ["Documento de identidad o pasaporte válido, según corresponda.", "Información personal y documentación requerida para la operación.", "Acreditación del origen lícito de los fondos destinados a la compra.", "Intervención de un escribano público para el estudio de títulos, controles legales y formalización de la compraventa."] },
  { title: "3. Compra mediante representante", paragraphs: ["No necesariamente es preciso viajar a Uruguay. En determinadas circunstancias la operación puede concretarse mediante un representante con poder otorgado con las formalidades legales correspondientes. El escribano debe revisar previamente el alcance y la validez del poder."],
  },
  { title: "4. Derechos del propietario", bullets: ["Adquirir inmuebles a su nombre.", "Utilizarlos para vivienda, descanso o inversión.", "Percibir ingresos por alquiler y disponer de ellos.", "Vender la propiedad y transferir fondos al exterior cumpliendo las obligaciones legales, fiscales y bancarias correspondientes."] },
  { title: "5. Impuestos y gastos", paragraphs: ["Al comprar, la operación puede comprender honorarios notariales, gastos de documentación y registro, honorarios inmobiliarios y el Impuesto a las Transmisiones Patrimoniales (ITP).", "En una compraventa habitual, el comprador abona un ITP equivalente al 2% del valor real catastral actualizado, que no debe confundirse con el precio de compraventa. Deben considerarse las exoneraciones o particularidades que pudieran corresponder."], table: { headers: ["Concepto", "Consideración"], rows: [["ITP", "2% del valor real catastral actualizado en una compraventa habitual; no se calcula sobre el precio de mercado. El escribano determina el importe y revisa particularidades."], ["Honorarios notariales", "Según el presupuesto del escribano, más gastos de documentación, registro, certificados y gestiones que correspondan."], ["Honorarios inmobiliarios", "Según lo acordado para la operación. Debe confirmarse por escrito."], ["Otros costos", "Tasas, timbres, aportes y gastos variables según el inmueble y la operación."]] } },
  { title: "6. Tributación mientras sos propietario", paragraphs: ["Deben contemplarse los tributos que correspondan al inmueble, como la Contribución Inmobiliaria y el Impuesto de Enseñanza Primaria, así como gastos comunes y mantenimiento. En determinados casos también puede corresponder el Impuesto al Patrimonio."],
  },
  { title: "7. Ingresos por alquiler y venta", paragraphs: ["Las rentas obtenidas por personas no residentes pueden estar alcanzadas por el Impuesto a las Rentas de los No Residentes (IRNR). En los regímenes habituales de retención o anticipo por arrendamiento, se aplica un 10,5% sobre los ingresos devengados, con las opciones de liquidación previstas por DGI.", "La venta puede generar obligaciones tributarias adicionales, incluido el IRNR sobre el incremento patrimonial que corresponda. La situación fiscal debe analizarse individualmente, considerando también las obligaciones que el inversor pudiera tener en su país de residencia."], callout: "El tratamiento fiscal depende de la situación concreta del inversor, el inmueble, la renta y el país de residencia." },
  { title: "8. Financiación para no residentes", paragraphs: ["Existen alternativas de financiación para compradores que residen en el exterior. Algunas instituciones bancarias ofrecen préstamos hipotecarios para no residentes, sujetos al análisis de ingresos, antecedentes, edad, capacidad de pago y demás condiciones crediticias.", "También pueden existir planes de financiación directa ofrecidos por desarrolladores inmobiliarios, particularmente en proyectos en construcción.", "La financiación no es automática ni necesariamente cubre la totalidad del precio. Cada alternativa requiere evaluar condiciones, plazos, costos y documentación."],
  },
  { title: "9. ¿Cómo te acompaña VPA?", paragraphs: ["Nuestra propuesta se basa en un asesoramiento personalizado y un análisis integral de la inversión."], bullets: ["Definir el objetivo de compra, presupuesto y plazo de inversión.", "Seleccionar propiedades acordes a tus necesidades.", "Analizar valores de mercado, rentabilidad potencial y costos asociados.", "Estudiar alternativas de pago y financiación disponibles.", "Coordinar la operación con los profesionales intervinientes.", "Evaluar opciones de alquiler y administración posterior."], callout: "Una propiedad atractiva no siempre representa la mejor inversión. La ubicación, la demanda de alquiler, los gastos, la financiación y las posibilidades futuras de venta forman parte de una decisión que debe analizarse cuidadosamente." },
];

const nonResidentsSectionsEn = translateSections(nonResidentsSectionsEs, {
  title: ["1. Buying without residency in Uruguay", "2. Requirements and documentation", "3. Buying through a representative", "4. Owner’s rights", "5. Taxes and costs", "6. Taxation while you own the property", "7. Rental income and sale", "8. Financing for non-residents", "9. How does VPA support you?"],
  paragraphs: [
    ["It is not necessary to have legal or tax residency in Uruguay to acquire property. In general terms, foreigners may acquire urban property, use it, rent it, and sell it in accordance with applicable law.", "Buying property does not automatically grant legal or tax residency. Immigration and tax status must be analyzed separately."],
    ["The buyer must provide personal documentation and the information required for the transaction and to prove the lawful source of funds."],
    ["It is not always necessary to travel to Uruguay. In certain circumstances, the transaction can be completed through a representative with a power of attorney granted with the required legal formalities. The notary must review the scope and validity of the power of attorney in advance."],
    undefined,
    ["At purchase, the transaction may include notarial fees, documentation and registry costs, real-estate fees, and the Property Transfer Tax (ITP).", "In a standard purchase, the buyer pays ITP equivalent to 2% of the updated cadastral real value, which must not be confused with the purchase price. Any applicable exemptions or particularities must be considered."],
    ["The taxes applicable to the property, such as Property Tax and Primary Education Tax, as well as common expenses and maintenance, must be considered. In some cases Wealth Tax may also apply."],
    ["Rental income received by non-residents may be subject to Non-Resident Income Tax (IRNR). Under usual withholding or advance-payment rental regimes, 10.5% is applied to accrued income, with the settlement options provided by DGI.", "A sale may generate additional tax obligations, including IRNR on any applicable capital gain. The tax situation must be analyzed individually, also considering obligations in the investor’s country of residence."],
    ["Financing alternatives exist for buyers living abroad. Some banks offer mortgages to non-residents, subject to analysis of income, history, age, repayment capacity, and other credit conditions.", "Developers may also offer direct financing plans, particularly for projects under construction.", "Financing is not automatic and does not necessarily cover the entire price. Each alternative requires reviewing conditions, terms, costs, and documentation."],
    ["Our proposal is based on personalized advice and a comprehensive analysis of the investment."],
  ],
  bullets: [
    ["Valid ID or passport, as applicable.", "Personal information and documentation required for the transaction.", "Proof of the lawful source of funds allocated to the purchase.", "Involvement of a notary for title study, legal controls, and formalization of the purchase."],
    undefined,
    undefined,
    ["Acquire property in their own name.", "Use it for housing, holidays, or investment.", "Receive rental income and dispose of it.", "Sell the property and transfer funds abroad while complying with legal, tax, and banking obligations."],
    undefined,
    undefined,
    undefined,
    undefined,
    ["Define the purchase objective, budget, and investment horizon.", "Select properties suited to your needs.", "Analyze market values, potential returns, and associated costs.", "Study available payment and financing alternatives.", "Coordinate the transaction with the professionals involved.", "Evaluate rental and subsequent management options."],
  ],
  callout: ["The ability to buy does not remove the need to comply with legal, banking, and tax controls.", undefined, undefined, undefined, undefined, undefined, "Tax treatment depends on the investor’s specific situation, the property, the income, and the country of residence.", undefined, "An attractive property is not always the best investment. Location, rental demand, costs, financing, and future sale possibilities must be carefully analyzed."],
  table: [undefined, undefined, undefined, undefined, { headers: ["Item", "Consideration"], rows: [["ITP", "2% of the updated cadastral real value in a standard purchase; it is not calculated on market price. The notary determines the amount and reviews particularities."], ["Notarial fees", "According to the notary’s budget, plus documentation, registry, certificates, and applicable procedures."], ["Real-estate fees", "As agreed for the transaction. Confirm in writing."], ["Other costs", "Taxes, stamps, contributions, and variable expenses according to the property and transaction."]] }, undefined, undefined, undefined, undefined],
});

const nonResidentsSectionsDe = translateSections(nonResidentsSectionsEs, {
  title: ["1. Kauf ohne Wohnsitz in Uruguay", "2. Anforderungen und Unterlagen", "3. Kauf durch einen Vertreter", "4. Rechte des Eigentümers", "5. Steuern und Kosten", "6. Besteuerung während des Eigentums", "7. Mieteinnahmen und Verkauf", "8. Finanzierung für Nichtresidenten", "9. Wie begleitet Sie VPA?"],
  paragraphs: [
    ["Für den Erwerb einer Immobilie ist kein rechtlicher oder steuerlicher Wohnsitz in Uruguay erforderlich. Grundsätzlich können Ausländer städtische Immobilien erwerben, nutzen, vermieten und gemäß der geltenden Gesetzgebung verkaufen.", "Der Kauf einer Immobilie verleiht nicht automatisch einen rechtlichen oder steuerlichen Wohnsitz. Aufenthalts- und Steuerstatus müssen getrennt geprüft werden."],
    ["Der Käufer muss persönliche Unterlagen sowie die für den Vorgang und den Nachweis der rechtmäßigen Herkunft der Mittel erforderlichen Informationen vorlegen."],
    ["Eine Reise nach Uruguay ist nicht immer erforderlich. Unter bestimmten Umständen kann der Vorgang durch einen Vertreter mit einer unter den erforderlichen rechtlichen Formalitäten erteilten Vollmacht abgewickelt werden. Der Notar muss Umfang und Gültigkeit der Vollmacht vorher prüfen."],
    undefined,
    ["Beim Kauf können Notargebühren, Dokumentations- und Registerkosten, Immobilienprovisionen und die Grunderwerbsteuer (ITP) anfallen.", "Bei einem üblichen Kauf zahlt der Käufer eine ITP von 2% des aktualisierten realen Katasterwerts, der nicht mit dem Kaufpreis verwechselt werden darf. Mögliche Befreiungen oder Besonderheiten sind zu prüfen."],
    ["Zu berücksichtigen sind die auf die Immobilie anwendbaren Steuern, wie Immobiliensteuer und Grundschulsteuer, sowie Gemeinschaftskosten und Instandhaltung. In bestimmten Fällen kann auch die Vermögensteuer anfallen."],
    ["Mieteinnahmen von Nichtresidenten können der Einkommensteuer für Nichtresidenten (IRNR) unterliegen. In den üblichen Einbehaltungs- oder Vorauszahlungsregelungen für Vermietungen werden 10,5% auf die angefallenen Einnahmen angewendet, mit den von der DGI vorgesehenen Abrechnungsoptionen.", "Ein Verkauf kann zusätzliche Steuerpflichten auslösen, darunter gegebenenfalls IRNR auf den Vermögenszuwachs. Die steuerliche Situation muss individuell geprüft werden, einschließlich der Pflichten im Wohnsitzland des Investors."],
    ["Für Käufer mit Wohnsitz im Ausland bestehen Finanzierungsmöglichkeiten. Einige Banken bieten Hypothekendarlehen für Nichtresidenten an, vorbehaltlich der Prüfung von Einkommen, Vorgeschichte, Alter, Zahlungsfähigkeit und weiteren Kreditbedingungen.", "Auch Bauträger können direkte Finanzierungspläne anbieten, insbesondere bei Projekten im Bau.", "Eine Finanzierung ist nicht automatisch und deckt nicht unbedingt den gesamten Preis. Jede Alternative erfordert die Prüfung von Bedingungen, Laufzeiten, Kosten und Unterlagen."],
    ["Unser Angebot basiert auf persönlicher Beratung und einer ganzheitlichen Analyse der Investition."],
  ],
  bullets: [
    ["Gültiger Personalausweis oder Reisepass.", "Persönliche Informationen und für den Vorgang erforderliche Unterlagen.", "Nachweis der rechtmäßigen Herkunft der für den Kauf bestimmten Mittel.", "Ein Notar für Titelprüfung, rechtliche Kontrollen und Beurkundung des Kaufs."],
    undefined,
    undefined,
    ["Immobilien im eigenen Namen erwerben.", "Sie zu Wohn-, Erholungs- oder Investitionszwecken nutzen.", "Mieteinnahmen erhalten und darüber verfügen.", "Die Immobilie verkaufen und Gelder unter Einhaltung der rechtlichen, steuerlichen und bankrechtlichen Pflichten ins Ausland überweisen."],
    undefined,
    undefined,
    undefined,
    undefined,
    ["Kaufziel, Budget und Anlagehorizont festlegen.", "Passende Immobilien auswählen.", "Marktwerte, potenzielle Rendite und verbundene Kosten analysieren.", "Zahlungs- und Finanzierungsmöglichkeiten prüfen.", "Den Vorgang mit den beteiligten Fachleuten koordinieren.", "Miet- und spätere Verwaltungsoptionen bewerten."],
  ],
  callout: ["Die Kaufmöglichkeit entbindet nicht von der Einhaltung rechtlicher, bankrechtlicher und steuerlicher Kontrollen.", undefined, undefined, undefined, undefined, undefined, "Die steuerliche Behandlung hängt von der konkreten Situation des Investors, der Immobilie, den Einnahmen und dem Wohnsitzland ab.", undefined, "Eine attraktive Immobilie ist nicht immer die beste Investition. Lage, Mietnachfrage, Kosten, Finanzierung und spätere Verkaufsmöglichkeiten müssen sorgfältig analysiert werden."],
  table: [undefined, undefined, undefined, undefined, { headers: ["Konzept", "Hinweis"], rows: [["ITP", "2% des aktualisierten realen Katasterwerts bei einem üblichen Kauf; nicht auf den Marktpreis berechnet. Der Notar bestimmt den Betrag und prüft Besonderheiten."], ["Notargebühren", "Gemäß Budget des Notars zuzüglich Dokumentations-, Register-, Bescheinigungs- und Bearbeitungskosten."], ["Immobilienprovision", "Nach Vereinbarung für den Vorgang. Schriftlich bestätigen."], ["Weitere Kosten", "Steuern, Stempel, Beiträge und variable Kosten je nach Immobilie und Vorgang."]] }, undefined, undefined, undefined, undefined],
});

const residentsFaqEs: UruguayGuideFaq[] = [
  { question: "¿El comprador paga IRPF por comprar?", answer: "La compra por sí misma no genera IRPF por incremento patrimonial para el comprador. El impuesto que pueda corresponder por la ganancia de la venta pertenece al vendedor y no debe incluirse como impuesto propio del comprador en este presupuesto." },
  { question: "¿El ITP se calcula sobre el precio de mercado?", answer: "No. En una compraventa habitual se calcula como 2% del valor real catastral actualizado por IPC. El escribano determina el importe en pesos y liquida el tributo." },
  { question: "¿El ejemplo de USD 100.000 es una cotización?", answer: "No. Es un ejemplo ilustrativo con supuestos concretos. Faltan posibles certificados, tasas, aportes y otros desembolsos, y el cálculo final depende del inmueble y del comprador." },
  { question: "¿Hay un porcentaje nacional único para la Contribución Inmobiliaria?", answer: "No. Depende del departamento, padrón, valor imponible y eventuales beneficios. Conviene solicitar las últimas facturas y una estimación anual." },
];
const residentsFaqEn = residentsFaqEs.map((_, index) => { const [question, answer] = ([
  ["Does the buyer pay IRPF when purchasing?", "The purchase itself does not create IRPF on capital gains for the buyer. Any tax due on the seller’s gain belongs to the seller and should not be included as the buyer’s own tax in this budget."],
  ["Is ITP calculated on market price?", "No. In a standard purchase it is calculated as 2% of the updated cadastral real value by CPI. The notary determines the amount in pesos and settles the tax."],
  ["Is the USD 100,000 example a quotation?", "No. It is an illustrative example with specific assumptions. Certificates, fees, contributions, and other disbursements may be added, and the final calculation depends on the property and buyer."],
  ["Is there one national percentage for Property Tax?", "No. It depends on the department, cadastral record, taxable value, and any applicable benefits. Request recent bills and an annual estimate."],
][index]); return { question, answer }; });
const residentsFaqDe = residentsFaqEs.map((_, index) => { const [question, answer] = ([
  ["Zahlt der Käufer beim Kauf IRPF?", "Der Kauf selbst löst für den Käufer keine IRPF auf einen Vermögenszuwachs aus. Eine Steuer auf den Gewinn aus einem Verkauf gehört zum Verkäufer und sollte in diesem Budget nicht als eigene Steuer des Käufers enthalten sein."],
  ["Wird die ITP auf den Marktpreis berechnet?", "Nein. Bei einem üblichen Kauf wird sie als 2% des mit IPC aktualisierten realen Katasterwerts berechnet. Der Notar bestimmt den Betrag in Pesos und rechnet die Steuer ab."],
  ["Ist das Beispiel von USD 100.000 ein Angebot?", "Nein. Es ist ein Beispiel mit konkreten Annahmen. Bescheinigungen, Gebühren, Beiträge und weitere Auszahlungen können hinzukommen; die endgültige Berechnung hängt von Immobilie und Käufer ab."],
  ["Gibt es einen einheitlichen nationalen Prozentsatz für die Immobiliensteuer?", "Nein. Sie hängt von Gemeinde, Katastereintrag, steuerlichem Wert und möglichen Vergünstigungen ab. Aktuelle Rechnungen und eine Jahresschätzung sollten angefordert werden."],
][index]); return { question, answer }; });

const nonResidentsFaqEs: UruguayGuideFaq[] = [
  { question: "¿Puedo comprar una propiedad sin ser residente?", answer: "Sí. No es necesario tener residencia legal ni fiscal uruguaya para adquirir un inmueble, aunque la operación debe cumplir los controles legales, bancarios y tributarios correspondientes." },
  { question: "¿La compra me otorga residencia?", answer: "No automáticamente. La compra de una propiedad no otorga por sí sola residencia legal o fiscal; esos aspectos deben analizarse por separado." },
  { question: "¿Puedo comprar sin viajar a Uruguay?", answer: "En determinadas circunstancias, la operación puede concretarse mediante un representante con un poder otorgado con las formalidades legales correspondientes, sujeto a revisión del escribano." },
  { question: "¿Qué impuesto puede alcanzar los alquileres?", answer: "Las rentas de personas no residentes pueden estar alcanzadas por IRNR. En los regímenes habituales indicados en la guía, se aplica un 10,5% sobre los ingresos devengados, con las opciones previstas por DGI." },
  { question: "¿Existe financiación para no residentes?", answer: "Existen alternativas sujetas al análisis de cada banco o desarrollador. La financiación no es automática ni necesariamente cubre todo el precio; deben evaluarse condiciones, plazos, costos y documentación." },
];
const nonResidentsFaqEn = nonResidentsFaqEs.map((_, index) => { const [question, answer] = ([
  ["Can I buy property without being a resident?", "Yes. Legal or tax residency in Uruguay is not required to acquire property, although the transaction must comply with the applicable legal, banking, and tax controls."],
  ["Does buying property grant residency?", "Not automatically. Buying property alone does not grant legal or tax residency; those matters must be analyzed separately."],
  ["Can I buy without traveling to Uruguay?", "In certain circumstances, the transaction can be completed through a representative with a power of attorney granted with the required legal formalities, subject to the notary’s review."],
  ["What tax may apply to rental income?", "Income received by non-residents may be subject to IRNR. Under the usual regimes described in the guide, 10.5% applies to accrued income, with the options provided by DGI."],
  ["Is financing available to non-residents?", "Alternatives may exist subject to each bank’s or developer’s analysis. Financing is not automatic and may not cover the entire price; conditions, terms, costs, and documentation must be reviewed."],
][index]); return { question, answer }; });
const nonResidentsFaqDe = nonResidentsFaqEs.map((_, index) => { const [question, answer] = ([
  ["Kann ich ohne Residentenstatus eine Immobilie kaufen?", "Ja. Für den Erwerb ist kein rechtlicher oder steuerlicher Wohnsitz in Uruguay erforderlich, aber der Vorgang muss die geltenden rechtlichen, bankrechtlichen und steuerlichen Kontrollen erfüllen."],
  ["Verleiht der Kauf einen Wohnsitz?", "Nicht automatisch. Der Kauf allein verleiht keinen rechtlichen oder steuerlichen Wohnsitz; diese Fragen müssen getrennt geprüft werden."],
  ["Kann ich kaufen, ohne nach Uruguay zu reisen?", "Unter bestimmten Umständen kann der Vorgang durch einen Vertreter mit einer formgerecht erteilten Vollmacht abgewickelt werden, vorbehaltlich der Prüfung durch den Notar."],
  ["Welche Steuer kann auf Mieteinnahmen anfallen?", "Einnahmen von Nichtresidenten können der IRNR unterliegen. Nach den im Leitfaden beschriebenen üblichen Regelungen werden 10,5% auf angefallene Einnahmen angewendet, mit den Optionen der DGI."],
  ["Gibt es eine Finanzierung für Nichtresidenten?", "Alternativen können vorbehaltlich der Prüfung durch die jeweilige Bank oder den Bauträger bestehen. Die Finanzierung ist nicht automatisch und deckt möglicherweise nicht den gesamten Preis; Bedingungen, Laufzeiten, Kosten und Unterlagen müssen geprüft werden."],
][index]); return { question, answer }; });

const spanish: GuideCopy = {
  residents: {
    eyebrow: "Guía informativa · Residentes",
    title: "Comprar un inmueble en Uruguay siendo residente",
    subtitle: "Una guía práctica para ordenar la documentación, revisar la operación y estimar los costos antes de reservar.",
    ctaLabel: "Solicitar asesoramiento",
    introduction: "Comprar una propiedad requiere mirar más allá del precio: la documentación, el origen de los fondos, la situación del inmueble y los gastos deben revisarse antes de asumir compromisos.",
    intent: "investment",
    sections: residentsSectionsEs,
    faqTitle: "Preguntas frecuentes",
    faq: residentsFaqEs,
    contactTitle: "¿Estás evaluando una compra en Uruguay?",
    contactDescription: "Contanos qué tipo de inmueble buscás, cuál es tu presupuesto y en qué etapa estás. Podemos ayudarte a ordenar la decisión y coordinar a los profesionales que intervienen.",
    disclaimer: "La información es orientativa. La liquidación final y los documentos exigibles se determinan para cada inmueble y comprador por el escribano, y por el banco cuando interviene financiación.",
  },
  nonResidents: {
    eyebrow: "Guía informativa · No residentes",
    title: "Invertir en Uruguay siendo no residente",
    subtitle: "Información práctica para adquirir una propiedad, generar ingresos o diversificar tu patrimonio desde el exterior.",
    ctaLabel: "Solicitar asesoramiento",
    introduction: "Uruguay ofrece un marco jurídico favorable para la inversión inmobiliaria extranjera, con igualdad de tratamiento para inversores nacionales y extranjeros.",
    intent: "investment",
    sections: nonResidentsSectionsEs,
    faqTitle: "Preguntas frecuentes",
    faq: nonResidentsFaqEs,
    contactTitle: "Hablemos de tu próxima inversión en Uruguay",
    contactDescription: "Contanos dónde residís, qué tipo de propiedad buscás y cuál es tu presupuesto. Te ayudamos a evaluar alternativas y próximos pasos.",
    disclaimer: "La información presentada es orientativa y está sujeta a modificaciones normativas. Las condiciones legales, tributarias y financieras deben verificarse para cada operación con los profesionales e instituciones correspondientes.",
  },
};

const english: GuideCopy = {
  residents: {
    eyebrow: "Information guide · Residents",
    title: "Buying property in Uruguay as a resident",
    subtitle: "A practical guide to organize documentation, review the transaction, and estimate costs before making a reservation.",
    ctaLabel: "Request advice",
    introduction: "Buying property requires looking beyond the price: documentation, source of funds, the property’s legal and technical situation, and related costs should be reviewed before making commitments.",
    intent: "investment",
    sections: residentsSectionsEn,
    faqTitle: "Frequently asked questions",
    faq: residentsFaqEn,
    contactTitle: "Are you considering a purchase in Uruguay?",
    contactDescription: "Tell us what type of property you are looking for, your budget, and what stage you are at. We can help you organize the decision and coordinate the professionals involved.",
    disclaimer: "This information is for guidance only. The final calculation and required documents are determined for each property and buyer by the notary, and by the bank when financing is involved.",
  },
  nonResidents: {
    eyebrow: "Information guide · Non-residents",
    title: "Investing in Uruguay as a non-resident",
    subtitle: "Practical information for acquiring property, generating rental income, or diversifying your assets from abroad.",
    ctaLabel: "Request advice",
    introduction: "Uruguay offers a favorable legal framework for foreign real estate investment, with equal treatment for national and foreign investors.",
    intent: "investment",
    sections: nonResidentsSectionsEn,
    faqTitle: "Frequently asked questions",
    faq: nonResidentsFaqEn,
    contactTitle: "Let’s talk about your next investment in Uruguay",
    contactDescription: "Tell us where you live, what type of property you are looking for, and your budget. We can help you evaluate alternatives and next steps.",
    disclaimer: "The information presented is for guidance only and may be affected by regulatory changes. Legal, tax, and financial conditions must be verified for each transaction with the relevant professionals and institutions.",
  },
};

const german: GuideCopy = {
  residents: {
    eyebrow: "Informationsleitfaden · Residents",
    title: "Als Resident eine Immobilie in Uruguay kaufen",
    subtitle: "Ein praktischer Leitfaden zu Unterlagen, Prüfung des Vorgangs und Kostenschätzung vor der Reservierung.",
    ctaLabel: "Beratung anfragen",
    introduction: "Beim Immobilienkauf muss man mehr als den Preis betrachten: Unterlagen, Herkunft der Mittel, rechtliche und technische Situation der Immobilie sowie die Nebenkosten sollten vor einer Verpflichtung geprüft werden.",
    intent: "investment",
    sections: residentsSectionsDe,
    faqTitle: "Häufige Fragen",
    faq: residentsFaqDe,
    contactTitle: "Planen Sie einen Kauf in Uruguay?",
    contactDescription: "Erzählen Sie uns, welche Immobilie Sie suchen, welches Budget Sie haben und in welcher Phase Sie sich befinden. Wir helfen Ihnen, die Entscheidung zu ordnen und die beteiligten Fachleute zu koordinieren.",
    disclaimer: "Diese Informationen dienen nur zur Orientierung. Die endgültige Berechnung und die erforderlichen Unterlagen werden für jede Immobilie und jeden Käufer vom Notar und bei einer Finanzierung von der Bank bestimmt.",
  },
  nonResidents: {
    eyebrow: "Informationsleitfaden · Nichtresidenten",
    title: "Als Nichtresident in Uruguay investieren",
    subtitle: "Praktische Informationen zum Erwerb einer Immobilie, zur Erzielung von Mieteinnahmen oder zur Diversifizierung Ihres Vermögens aus dem Ausland.",
    ctaLabel: "Beratung anfragen",
    introduction: "Uruguay bietet einen günstigen rechtlichen Rahmen für ausländische Immobilieninvestitionen mit gleicher Behandlung nationaler und ausländischer Investoren.",
    intent: "investment",
    sections: nonResidentsSectionsDe,
    faqTitle: "Häufige Fragen",
    faq: nonResidentsFaqDe,
    contactTitle: "Sprechen wir über Ihre nächste Investition in Uruguay",
    contactDescription: "Erzählen Sie uns, wo Sie leben, welche Immobilie Sie suchen und welches Budget Sie haben. Wir helfen Ihnen, Alternativen und nächste Schritte zu bewerten.",
    disclaimer: "Die dargestellten Informationen dienen nur zur Orientierung und können sich aufgrund von Gesetzesänderungen ändern. Rechtliche, steuerliche und finanzielle Bedingungen müssen für jeden Vorgang mit den zuständigen Fachleuten und Institutionen geprüft werden.",
  },
};

export function getUruguayGuideContent(locale: PublicLocale, kind: keyof GuideCopy) {
  const copy = locale === "en" ? english : locale === "de" ? german : spanish;
  return copy[kind];
}

function translateSections(
  source: UruguayGuideSection[],
  translation: {
    bullets: (string[] | undefined)[];
    callout: (string | undefined)[];
    paragraphs: (string[] | undefined)[];
    table: (UruguayGuideSection["table"] | undefined)[];
    title: string[];
  },
): UruguayGuideSection[] {
  return source.map((section, index) => ({
    ...section,
    title: translation.title[index],
    paragraphs: translation.paragraphs[index],
    bullets: translation.bullets[index],
    callout: translation.callout[index],
    table: translation.table[index],
  }));
}
