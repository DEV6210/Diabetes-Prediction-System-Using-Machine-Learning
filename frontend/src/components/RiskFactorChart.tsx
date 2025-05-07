
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from "recharts";

interface ChartProps {
  patientData: {
    glucose: number;
    bloodPressure: number;
    bmi: number;
    age: number;
    [key: string]: number;
  };
}

export const RiskFactorChart = ({ patientData }: ChartProps) => {
  // Reference ranges for health metrics
  const referenceRanges = {
    glucose: { min: 70, max: 99, high: 100 }, // mg/dL
    bloodPressure: { min: 60, max: 120, high: 120 }, // mmHg (systolic)
    bmi: { min: 18.5, max: 24.9, high: 25 }, // kg/m²
  };

  const calculatePercentOfRange = (value: number, metric: string) => {
    const range = referenceRanges[metric as keyof typeof referenceRanges];
    if (!range) return 0;
    
    // Calculate value as percentage of normal range
    return Math.min(100, Math.max(0, (value / range.high) * 100));
  };

  const data = [
    {
      name: "Glucose",
      value: calculatePercentOfRange(patientData.glucose, "glucose"),
      actual: patientData.glucose,
      unit: "mg/dL",
      fill: patientData.glucose >= referenceRanges.glucose.high ? "#ef4444" : "#10b981",
    },
    {
      name: "Blood Pressure",
      value: calculatePercentOfRange(patientData.bloodPressure, "bloodPressure"),
      actual: patientData.bloodPressure,
      unit: "mmHg",
      fill: patientData.bloodPressure >= referenceRanges.bloodPressure.high ? "#ef4444" : "#10b981",
    },
    {
      name: "BMI",
      value: calculatePercentOfRange(patientData.bmi, "bmi"),
      actual: patientData.bmi,
      unit: "kg/m²",
      fill: patientData.bmi >= referenceRanges.bmi.high ? "#ef4444" : "#10b981",
    },
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-2 border shadow-sm rounded text-xs">
          <p className="font-medium">{data.name}: {data.actual} {data.unit}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">Key Health Metrics</h3>
      <div className="h-[160px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 5, right: 5, bottom: 5, left: 60 }}
          >
            <XAxis type="number" domain={[0, 120]} tick={{ fontSize: 12 }} hide />
            <YAxis
              dataKey="name"
              type="category"
              tick={{ fontSize: 12 }}
              width={80}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-center mt-2 space-x-4 text-xs">
        <div className="flex items-center">
          <span className="w-3 h-3 bg-green-500 rounded-full inline-block mr-1"></span>
          <span>Normal Range</span>
        </div>
        <div className="flex items-center">
          <span className="w-3 h-3 bg-red-500 rounded-full inline-block mr-1"></span>
          <span>Elevated</span>
        </div>
      </div>
    </div>
  );
};
