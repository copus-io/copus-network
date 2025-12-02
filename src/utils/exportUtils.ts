import { FinancialRecord } from '../components/FinancialRecords/FinancialRecords';

// 导出财务记录为CSV格式
export const exportFinancialRecordsToCSV = (records: FinancialRecord[]): void => {
  const headers = [
    '日期',
    '时间',
    '类型',
    '描述',
    '分类',
    '金额',
    '货币',
    '状态',
    '手续费',
    '关联内容',
    '交易ID'
  ];

  const csvContent = [
    headers.join(','),
    ...records.map(record => [
      record.date,
      record.time,
      getTypeText(record.type),
      `"${record.description}"`,
      record.category,
      record.amount,
      record.currency,
      getStatusText(record.status),
      record.fee || 0,
      `"${record.relatedContent || ''}"`,
      record.transactionId || ''
    ].join(','))
  ].join('\n');

  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `财务记录_${new Date().toLocaleDateString('zh-CN')}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};

// 获取类型文本
const getTypeText = (type: string): string => {
  switch (type) {
    case 'income':
      return '收益';
    case 'expense':
      return '支出';
    case 'withdrawal':
      return '提现';
    default:
      return type;
  }
};

// 获取状态文本
const getStatusText = (status: string): string => {
  switch (status) {
    case 'completed':
      return '已完成';
    case 'pending':
      return '处理中';
    case 'failed':
      return '失败';
    default:
      return status;
  }
};

// 生成财务报告摘要
export const generateFinancialSummary = (records: FinancialRecord[]): string => {
  const totalIncome = records
    .filter(r => r.type === 'income' && r.status === 'completed')
    .reduce((sum, r) => sum + r.amount, 0);

  const totalExpense = records
    .filter(r => r.type === 'expense' && r.status === 'completed')
    .reduce((sum, r) => sum + r.amount, 0);

  const totalWithdrawal = records
    .filter(r => r.type === 'withdrawal' && r.status === 'completed')
    .reduce((sum, r) => sum + r.amount, 0);

  const netEarnings = totalIncome - totalExpense;

  return `
财务记录摘要 (${new Date().toLocaleDateString('zh-CN')})
=============================================
📈 总收益: ${totalIncome.toFixed(2)} USDC
💸 总支出: ${totalExpense.toFixed(2)} USDC
🏦 总提现: ${totalWithdrawal.toFixed(2)} USDC
💰 净收益: ${netEarnings.toFixed(2)} USDC

记录总数: ${records.length} 条
已完成交易: ${records.filter(r => r.status === 'completed').length} 条
处理中交易: ${records.filter(r => r.status === 'pending').length} 条
失败交易: ${records.filter(r => r.status === 'failed').length} 条
=============================================
  `.trim();
};