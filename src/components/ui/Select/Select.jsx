export default function Select({ selectedPeriod, onChange, periods }) {

  return (
    <select
      value={selectedPeriod}
      onChange={onChange}
      className="px-3 py-1.5 text-xs border rounded-full bg-white text-gray-700 shadow-sm focus:outline-none ring-[#DFDFDF] ring-1"
    >
      {periods.map((period) => (
        <option key={period} value={period}>
          {period}
        </option>
      ))}
    </select>
  );
}
