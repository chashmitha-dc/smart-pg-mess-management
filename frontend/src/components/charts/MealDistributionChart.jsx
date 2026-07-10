import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

const colors = ["#1976d2", "#00b894", "#ff9800"];

function MealDistributionChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" outerRadius={90} label>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

export default MealDistributionChart;
