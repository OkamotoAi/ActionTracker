import {
  ComposedChart,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  CartesianGrid,
} from "recharts";

const dummyData = [
  { date: "2024-03-20", activity: "睡眠", startHour: 0, endHour: 7 },
  { date: "2024-03-20", activity: "朝食", startHour: 7, endHour: 8 },
  { date: "2024-03-20", activity: "仕事", startHour: 9, endHour: 17 },
  { date: "2024-03-20", activity: "ジム", startHour: 18, endHour: 19 },
  { date: "2024-03-20", activity: "夕食", startHour: 19, endHour: 20 },
  { date: "2024-03-20", activity: "自由時間", startHour: 20, endHour: 23 },

  { date: "2024-03-21", activity: "睡眠", startHour: 0, endHour: 6 },
  { date: "2024-03-21", activity: "仕事", startHour: 9, endHour: 17 },
  { date: "2024-03-21", activity: "趣味", startHour: 18, endHour: 20 },
  { date: "2024-03-21", activity: "夕食", startHour: 20, endHour: 21 },
  { date: "2024-03-21", activity: "自由時間", startHour: 21, endHour: 23 },
];

const processData = () => {
  return dummyData.map((entry) => ({
    date: entry.date,
    start: entry.startHour,
    duration: entry.endHour - entry.startHour,
    activity: entry.activity,
  }));
};

export default function ActivityChart() {
  const chartData = processData();

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-4">行動記録グラフ</h2>
      <ComposedChart
        width={800}
        height={500}
        data={chartData}
        layout="vertical"
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          type="number"
          domain={[0, 24]}
          tickCount={25}
          label={{ value: "時間 (0-24)", position: "insideBottom" }}
        />
        <YAxis
          dataKey="date"
          type="category"
          label={{ value: "日付", angle: -90, position: "insideLeft" }}
        />
        <Tooltip />
        <Bar dataKey="duration" barSize={20} fill="#82ca9d" />
      </ComposedChart>
    </div>
  );
}
