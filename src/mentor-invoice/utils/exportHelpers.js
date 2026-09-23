/**
 * Export helpers to generate CSV/Excel files formatted exactly like the manual Google Sheet
 * for sharing directly with the Accounts Team.
 */

export const exportInvoiceToCSV = (invoice) => {
  if (!invoice) return;

  const escape = (val) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const lines = [];

  // Top Title
  lines.push([escape('GUVI'), escape('HCL'), escape('Mentor Attendance Tracker and Payment Invoice Sheet')].join(','));
  lines.push('');

  // Mentor Summary Block
  lines.push([
    escape('Mentor Name:'), escape(invoice.mentorName || ''),
    escape(''), escape(''),
    escape('Total Hours:'), escape(invoice.totalHours || '0.0'),
    escape('Name:'), escape(invoice.mentorName || ''),
  ].join(','));

  lines.push([
    escape('Course Name:'), escape(invoice.courseName || ''),
    escape(''), escape(''),
    escape('Total No.of Sessions:'), escape(invoice.totalSessions || '0'),
    escape('Acc.No:'), escape(invoice.bankDetails?.accountNumber ? `'${invoice.bankDetails.accountNumber}` : ''),
  ].join(','));

  lines.push([
    escape('Pay per Hour:'), escape(invoice.hourlyRate || '0'),
    escape(''), escape(''),
    escape('Total Amount:'), escape(`₹${invoice.totalAmount || 0}`),
    escape('IFSC:'), escape(invoice.bankDetails?.ifsc || ''),
  ].join(','));

  lines.push([
    escape(''), escape(''),
    escape(''), escape(''),
    escape(''), escape(''),
    escape('PAN No:'), escape(invoice.bankDetails?.panNumber || ''),
  ].join(','));

  lines.push(''); // Blank separator

  // Table Headers
  lines.push([
    escape('Date (MM/DD/YY)'),
    escape('Course Name'),
    escape('Batch Code'),
    escape('Interview / Session'),
    escape('Hours'),
    escape('Host'),
    escape('Comments (Combined Batches)'),
    escape('Scheduled Date'),
    escape('Scheduled Start Time'),
    escape('Scheduled End Time'),
    escape('Actual Joined Time'),
    escape('Actual Left Time'),
  ].join(','));

  // Session line items
  if (invoice.items && invoice.items.length > 0) {
    invoice.items.forEach((item) => {
      lines.push([
        escape(item.date || ''),
        escape(item.courseName || ''),
        escape(item.batchCode || ''),
        escape(item.interview || 'Live Class'),
        escape(item.hours || '0.0'),
        escape(item.hostStatus || 'Done'),
        escape(item.comments || ''),
        escape(item.scheduledDate || ''),
        escape(item.scheduledStartTime || ''),
        escape(item.scheduledEndTime || ''),
        escape(item.actualJoinedTime || ''),
        escape(item.actualLeftTime || ''),
      ].join(','));
    });
  }

  // Summary Row at bottom
  lines.push([
    escape('TOTAL'),
    escape(''),
    escape(''),
    escape(`${invoice.totalSessions || 0} Sessions`),
    escape(invoice.totalHours || '0.0'),
    escape(''),
    escape(''),
    escape(''),
    escape(''),
    escape(''),
    escape('TOTAL PAYABLE:'),
    escape(`₹${invoice.totalAmount || 0}`),
  ].join(','));

  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + lines.join('\r\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  const filename = `${invoice.mentorName?.replace(/\s+/g, '_')}_Mentor_Invoice_${invoice.billingPeriodLabel || 'Aug_Sep'}.csv`;

  link.setAttribute('href', encodedUri);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
