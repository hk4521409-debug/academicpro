import React from 'react';
import { useData } from '../context/DataContext';
import { Card } from '../components/ui/Common';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, AlertTriangle, DollarSign } from 'lucide-react';

const Metric = ({ title, value, icon: Icon, color, trend }: any) => (
    <div className="bg-white rounded-lg p-5 shadow border border-gray-100 flex items-center justify-between">
        <div>
            <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">{title}</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
            {trend && <span className="text-xs text-green-600 font-medium flex items-center mt-2"><TrendingUp className="w-3 h-3 mr-1"/> {trend}</span>}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
            <Icon className="w-6 h-6 text-white" />
        </div>
    </div>
);

export const Dashboard = () => {
  const { state, getStudents } = useData();
  const students = getStudents();
  const faculty = state.faculty.filter(f => !f.isDeleted);

  const atRiskCount = students.filter(s => s.status === 'At-Risk').length;
  const avgAttendance = (students.reduce((acc, s) => acc + s.attendance, 0) / (students.length || 1)).toFixed(1);
  const totalFeesDue = students.reduce((acc, s) => acc + s.feesDue, 0).toLocaleString();

  // Mock Data for Charts
  const passRateData = [
      { name: 'Jan', rate: 85 }, { name: 'Feb', rate: 88 }, { name: 'Mar', rate: 87 },
      { name: 'Apr', rate: 90 }, { name: 'May', rate: 92 }, { name: 'Jun', rate: 89 },
  ];

  const deptData = students.reduce((acc: any, s) => {
      acc[s.department] = (acc[s.department] || 0) + 1;
      return acc;
  }, {});
  const pieData = Object.keys(deptData).map(key => ({ name: key, value: deptData[key] }));
  const COLORS = ['#0ea5e9', '#22c55e', '#eab308', '#f97316', '#8b5cf6'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Executive Overview</h1>
          <span className="text-sm text-gray-500">Last updated: Just now</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Metric title="Total Students" value={students.length} icon={Users} color="bg-blue-500" trend="+5% this month" />
          <Metric title="At-Risk Students" value={atRiskCount} icon={AlertTriangle} color="bg-red-500" trend="-2% improvement" />
          <Metric title="Avg Attendance" value={`${avgAttendance}%`} icon={TrendingUp} color="bg-green-500" trend="Stable" />
          <Metric title="Outstanding Fees" value={`$${totalFeesDue}`} icon={DollarSign} color="bg-yellow-500" trend="Action Needed" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="h-96">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Pass Rate Trends</h3>
              <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={passRateData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} />
                      <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                      <Line type="monotone" dataKey="rate" stroke="#0ea5e9" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
                  </LineChart>
              </ResponsiveContainer>
          </Card>

          <Card className="h-96">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Department Distribution</h3>
              <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                      <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                      >
                          {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                      </Pie>
                      <Tooltip />
                  </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-4 mt-4">
                  {pieData.map((entry, index) => (
                      <div key={index} className="flex items-center text-xs text-gray-600">
                          <span className="w-3 h-3 rounded-full mr-1" style={{backgroundColor: COLORS[index % COLORS.length]}}></span>
                          {entry.name}
                      </div>
                  ))}
              </div>
          </Card>
      </div>
      
      {/* Intelligence Widget */}
      <Card className="border-l-4 border-brand-500">
          <h3 className="text-lg font-bold text-gray-800 flex items-center">
              <span className="bg-brand-100 p-1 rounded mr-2">🤖</span> 
              System Intelligence Recommendations
          </h3>
          <ul className="mt-4 space-y-2">
              {atRiskCount > 5 && (
                  <li className="flex items-start text-sm text-gray-700 bg-red-50 p-3 rounded">
                      <AlertTriangle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0" />
                      <span><strong>Critical:</strong> {atRiskCount} students have dropped below 75% attendance. Immediate intervention is recommended via the Faculty portal.</span>
                  </li>
              )}
              <li className="flex items-start text-sm text-gray-700 bg-blue-50 p-3 rounded">
                  <TrendingUp className="w-5 h-5 text-blue-500 mr-2 flex-shrink-0" />
                  <span><strong>Performance:</strong> Computer Science department shows a 12% increase in average GPA this semester.</span>
              </li>
          </ul>
      </Card>
    </div>
  );
};
