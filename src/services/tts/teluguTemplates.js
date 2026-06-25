export const TELUGU = {
  feeDue: (studentName, amount) =>
    `నమస్కారం. ${studentName} గారి ఫీజులో రూపాయలు ${amount} బకాయి ఉంది. దయచేసి చెల్లించండి. ధన్యవాదాలు.`,

  feePaid: studentName =>
    `నమస్కారం. ${studentName} గారి ఫీజు విజయవంతంగా స్వీకరించబడింది. ధన్యవాదాలు.`,

  resultsPublished: (studentName, examName) =>
    `నమస్కారం. ${studentName} గారి ${examName} పరీక్ష ఫలితాలు విడుదలయ్యాయి. పూర్తి వివరాల కోసం యాప్ ను చూడండి.`,

  marksPublished: (studentName, examName, totalMarks) =>
    `నమస్కారం. ${studentName} గారు ${examName} పరీక్షలో ${totalMarks} మార్కులు సాధించారు.`,

  attendanceAlert: (studentName, percentage) =>
    `నమస్కారం. ${studentName} గారి హాజరు ప్రస్తుతం ${percentage} శాతం ఉంది.`,

  holidayAnnouncement: (holidayName, holidayDate) =>
    `నమస్కారం. ${holidayName} సందర్భంగా ${holidayDate} న పాఠశాలకు సెలవు ప్రకటించబడింది.`,

  schoolAnnouncement: title =>
    `నమస్కారం. పాఠశాల నుండి కొత్త ప్రకటన. ${title}. పూర్తి వివరాల కోసం యాప్ ను చూడండి.`,

  notification: (title, message) =>
    `నమస్కారం. ${title}. ${message}`,
};
