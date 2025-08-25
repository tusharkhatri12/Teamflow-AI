import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import { TrendingUp, Users, MessageSquare, Calendar, Activity } from 'lucide-react';

const Analytics = ({ user }) => {
  const [analyticsData, setAnalyticsData] = useState({
    standupsOverTime: [],
    topEmployees: [],
    wordFrequency: [],
    totalMessages: 0,
    totalEmployees: 0,
    averageMessagesPerDay: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState('week'); // week, month, quarter

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'https://teamflow-ai.onrender.com';
      
      // Fetch analytics data from the new endpoint
      const response = await fetch(`${apiUrl}/slack/analytics?timeRange=${timeRange}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.analytics) {
          setAnalyticsData({
            standupsOverTime: data.analytics.timeData || [],
            topEmployees: data.analytics.employeeData || [],
            wordFrequency: data.analytics.wordData || [],
            totalMessages: data.analytics.totalMessages || 0,
            totalEmployees: data.analytics.totalEmployees || 0,
            averageMessagesPerDay: data.analytics.totalMessages / Math.max(1, (data.analytics.timeData || []).length)
          });
        } else {
          setError('Invalid analytics data received');
        }
      } else {
        setError('Failed to fetch analytics data');
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setError('Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF6B6B', '#4ECDC4', '#45B7D1'];

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="analytics-loading"
        style={{ 
          padding: '40px', 
          textAlign: 'center',
          background: 'rgba(255,255,255,0.95)',
          borderRadius: '16px',
          margin: '20px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        }}
      >
        <div style={{ fontSize: '18px', color: '#6c757d' }}>Loading analytics...</div>
      </motion.div>
    );
  }

  return (
    <div className="analytics-container" style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ 
          background: 'rgba(255,255,255,0.95)',
          borderRadius: '20px',
          padding: '32px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          border: '1px solid rgba(255,255,255,0.2)',
          marginBottom: '24px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
          }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <h1 style={{ 
              color: '#1a1a1a',
              margin: 0,
              fontSize: '28px',
              fontWeight: '700'
            }}>
              Analytics Dashboard
            </h1>
            <p style={{ 
              color: '#6b7280',
              margin: '4px 0 0 0',
              fontSize: '16px'
            }}>
              Insights into your team's communication patterns and engagement
            </p>
          </div>
        </div>

        {/* Time Range Selector */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <span style={{ color: '#6b7280', fontWeight: '500' }}>Time Range:</span>
            {['week', 'month'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  background: timeRange === range ? '#8b5cf6' : '#f3f4f6',
                  color: timeRange === range ? 'white' : '#6b7280',
                  cursor: 'pointer',
                  fontWeight: '500',
                  transition: 'all 0.2s'
                }}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Summary Stats */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '20px',
          marginBottom: '32px'
        }}>
          <motion.div
            whileHover={{ scale: 1.02 }}
            style={{
              background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
              padding: '24px',
              borderRadius: '16px',
              border: '1px solid #3b82f6',
              textAlign: 'center'
            }}
          >
            <MessageSquare size={24} color="#3b82f6" style={{ marginBottom: '12px' }} />
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#1e40af', marginBottom: '4px' }}>
              {analyticsData.totalMessages}
            </div>
            <div style={{ fontSize: '14px', color: '#1e40af' }}>Total Messages</div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            style={{
              background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
              padding: '24px',
              borderRadius: '16px',
              border: '1px solid #f59e0b',
              textAlign: 'center'
            }}
          >
            <Users size={24} color="#f59e0b" style={{ marginBottom: '12px' }} />
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#d97706', marginBottom: '4px' }}>
              {analyticsData.totalEmployees}
            </div>
            <div style={{ fontSize: '14px', color: '#d97706' }}>Active Employees</div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            style={{
              background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
              padding: '24px',
              borderRadius: '16px',
              border: '1px solid #10b981',
              textAlign: 'center'
            }}
          >
            <Activity size={24} color="#10b981" style={{ marginBottom: '12px' }} />
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#059669', marginBottom: '4px' }}>
              {analyticsData.averageMessagesPerDay.toFixed(1)}
            </div>
            <div style={{ fontSize: '14px', color: '#059669' }}>Avg Messages/Day</div>
          </motion.div>
        </div>
      </motion.div>

      {/* Charts Grid */}
      <div style={{ display: 'grid', gap: '24px' }}>
        {/* Standups Over Time Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            background: 'rgba(255,255,255,0.95)',
            borderRadius: '20px',
            padding: '32px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
          }}
        >
          <h3 style={{ 
            margin: '0 0 24px 0', 
            color: '#1a1a1a', 
            fontSize: '20px', 
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <Calendar size={20} color="#8b5cf6" />
            Standups Over Time
          </h3>
          
          {analyticsData.standupsOverTime.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData.standupsOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="date" 
                  stroke="#6b7280"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#6b7280"
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{
                    background: 'rgba(255,255,255,0.95)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="messages" 
                  stroke="#8b5cf6" 
                  strokeWidth={3}
                  dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#8b5cf6', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ 
              textAlign: 'center', 
              padding: '60px 20px', 
              color: '#6b7280' 
            }}>
              <Calendar size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
              <p style={{ fontSize: '16px', margin: 0 }}>No data available for the selected time range.</p>
            </div>
          )}
        </motion.div>

        {/* Top Active Employees Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{
            background: 'rgba(255,255,255,0.95)',
            borderRadius: '20px',
            padding: '32px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
          }}
        >
          <h3 style={{ 
            margin: '0 0 24px 0', 
            color: '#1a1a1a', 
            fontSize: '20px', 
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <Users size={20} color="#10b981" />
            Top Active Employees
          </h3>
          
          {analyticsData.topEmployees.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.topEmployees}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="user" 
                  stroke="#6b7280"
                  fontSize={12}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  stroke="#6b7280"
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{
                    background: 'rgba(255,255,255,0.95)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                />
                <Legend />
                <Bar 
                  dataKey="count" 
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ 
              textAlign: 'center', 
              padding: '60px 20px', 
              color: '#6b7280' 
            }}>
              <Users size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
              <p style={{ fontSize: '16px', margin: 0 }}>No employee data available.</p>
            </div>
          )}
        </motion.div>

        {/* Word Frequency Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={{
            background: 'rgba(255,255,255,0.95)',
            borderRadius: '20px',
            padding: '32px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
          }}
        >
          <h3 style={{ 
            margin: '0 0 24px 0', 
            color: '#1a1a1a', 
            fontSize: '20px', 
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <MessageSquare size={20} color="#f59e0b" />
            Most Used Keywords
          </h3>
          
          {analyticsData.wordFrequency.length > 0 ? (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', 
              gap: '16px',
              maxHeight: '400px',
              overflowY: 'auto'
            }}>
              {analyticsData.wordFrequency.map((item, index) => (
                <motion.div
                  key={item.word}
                  whileHover={{ scale: 1.05 }}
                  style={{
                    background: `linear-gradient(135deg, ${COLORS[index % COLORS.length]}20 0%, ${COLORS[index % COLORS.length]}10 100%)`,
                    border: `2px solid ${COLORS[index % COLORS.length]}`,
                    borderRadius: '12px',
                    padding: '16px',
                    textAlign: 'center',
                    position: 'relative'
                  }}
                >
                  <div style={{ 
                    fontSize: '14px', 
                    fontWeight: '600', 
                    color: COLORS[index % COLORS.length],
                    marginBottom: '8px'
                  }}>
                    {item.word}
                  </div>
                  <div style={{ 
                    fontSize: '20px', 
                    fontWeight: '700', 
                    color: COLORS[index % COLORS.length]
                  }}>
                    {item.count}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div style={{ 
              textAlign: 'center', 
              padding: '60px 20px', 
              color: '#6b7280' 
            }}>
              <MessageSquare size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
              <p style={{ fontSize: '16px', margin: 0 }}>No keyword data available.</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ 
            color: '#dc2626', 
            background: '#fef2f2', 
            padding: '16px', 
            borderRadius: '12px', 
            marginTop: '24px',
            border: '1px solid #fecaca',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#dc2626' }} />
          {error}
        </motion.div>
      )}
    </div>
  );
};

export default Analytics;
