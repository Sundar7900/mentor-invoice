/**
 * Navigation items for Zen Portal sidebar adhering to HACKATHON_RULES.md (Rule 2)
 * Exports [{ label, route, key, image }]
 */
const navItems = [
  {
    label: 'Mentor Invoices',
    route: '/mentor-invoice',
    key: 'mentor-invoice',
    image: 'receipt_long',
  },
  {
    label: 'Mentor Rates & Bank Info',
    route: '/mentor-invoice/rates',
    key: 'mentor-invoice-rates',
    image: 'account_balance',
  },
];

export default navItems;
