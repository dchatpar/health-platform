'use client';

import { Box, Card, CardContent, Typography, useTheme, alpha } from '@mui/material';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts';

interface ChartProps {
  title?: string;
  subtitle?: string;
  height?: number;
}

const COLORS = ['#0ea5e9', '#a855f7', '#22c55e', '#f59e0b', '#ef4444', '#3b82f6'];

export function SalesAreaChart({ title, subtitle, height = 300 }: ChartProps) {
  const theme = useTheme();

  const data = [
    { name: 'Mon', sales: 4000, orders: 24 },
    { name: 'Tue', sales: 3000, orders: 18 },
    { name: 'Wed', sales: 5000, orders: 30 },
    { name: 'Thu', sales: 4500, orders: 27 },
    { name: 'Fri', sales: 6000, orders: 36 },
    { name: 'Sat', sales: 5500, orders: 33 },
    { name: 'Sun', sales: 4200, orders: 25 },
  ];

  return (
    <Card>
      <CardContent>
        {(title || subtitle) && (
          <Box sx={{ mb: 3 }}>
            {title && (
              <Typography variant="h6" fontWeight={600}>
                {title}
              </Typography>
            )}
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
        )}
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.3} />
                <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke={theme.palette.text.secondary} />
            <YAxis tick={{ fontSize: 12 }} stroke={theme.palette.text.secondary} />
            <Tooltip
              contentStyle={{
                backgroundColor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 8,
              }}
            />
            <Area
              type="monotone"
              dataKey="sales"
              stroke={theme.palette.primary.main}
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorSales)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function OrdersBarChart({ title, subtitle, height = 300 }: ChartProps) {
  const theme = useTheme();

  const data = [
    { name: 'Pending', orders: 12, color: '#f59e0b' },
    { name: 'Preparing', orders: 8, color: '#3b82f6' },
    { name: 'Ready', orders: 5, color: '#0ea5e9' },
    { name: 'Delivered', orders: 45, color: '#22c55e' },
    { name: 'Cancelled', orders: 3, color: '#ef4444' },
  ];

  return (
    <Card>
      <CardContent>
        {(title || subtitle) && (
          <Box sx={{ mb: 3 }}>
            {title && (
              <Typography variant="h6" fontWeight={600}>
                {title}
              </Typography>
            )}
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
        )}
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke={theme.palette.text.secondary} />
            <YAxis tick={{ fontSize: 12 }} stroke={theme.palette.text.secondary} />
            <Tooltip
              contentStyle={{
                backgroundColor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 8,
              }}
            />
            <Bar dataKey="orders" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function CategoryPieChart({ title, subtitle, height = 300 }: ChartProps) {
  const theme = useTheme();

  const data = [
    { name: 'Antibiotics', value: 35 },
    { name: 'Pain Relief', value: 25 },
    { name: 'Diabetes', value: 20 },
    { name: 'Gastrointestinal', value: 12 },
    { name: 'Respiratory', value: 8 },
  ];

  return (
    <Card>
      <CardContent>
        {(title || subtitle) && (
          <Box sx={{ mb: 3 }}>
            {title && (
              <Typography variant="h6" fontWeight={600}>
                {title}
              </Typography>
            )}
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
        )}
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              labelLine={false}
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 8,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function WeeklyTrendChart({ title, subtitle, height = 300 }: ChartProps) {
  const theme = useTheme();

  const data = [
    { name: 'Week 1', thisWeek: 45000, lastWeek: 38000 },
    { name: 'Week 2', thisWeek: 52000, lastWeek: 45000 },
    { name: 'Week 3', thisWeek: 48000, lastWeek: 42000 },
    { name: 'Week 4', thisWeek: 58000, lastWeek: 50000 },
  ];

  return (
    <Card>
      <CardContent>
        {(title || subtitle) && (
          <Box sx={{ mb: 3 }}>
            {title && (
              <Typography variant="h6" fontWeight={600}>
                {title}
              </Typography>
            )}
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
        )}
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke={theme.palette.text.secondary} />
            <YAxis tick={{ fontSize: 12 }} stroke={theme.palette.text.secondary} />
            <Tooltip
              contentStyle={{
                backgroundColor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 8,
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="thisWeek"
              stroke={theme.palette.primary.main}
              strokeWidth={2}
              dot={{ fill: theme.palette.primary.main }}
              name="This Week"
            />
            <Line
              type="monotone"
              dataKey="lastWeek"
              stroke={theme.palette.secondary.main}
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ fill: theme.palette.secondary.main }}
              name="Last Week"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function TopMedicinesChart({ title, subtitle, height = 300 }: ChartProps & { data: Array<{ name: string; value: number }> }) {
  const theme = useTheme();

  return (
    <Card>
      <CardContent>
        {(title || subtitle) && (
          <Box sx={{ mb: 3 }}>
            {title && (
              <Typography variant="h6" fontWeight={600}>
                {title}
              </Typography>
            )}
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
        )}
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
            <XAxis type="number" tick={{ fontSize: 12 }} stroke={theme.palette.text.secondary} />
            <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={100} stroke={theme.palette.text.secondary} />
            <Tooltip
              contentStyle={{
                backgroundColor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 8,
              }}
            />
            <Bar dataKey="value" fill={theme.palette.primary.main} radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function StockLevelChart({
  title,
  subtitle,
  height = 300,
}: ChartProps & {
  data: Array<{ name: string; current: number; min: number; max: number }>;
}) {
  const theme = useTheme();

  return (
    <Card>
      <CardContent>
        {(title || subtitle) && (
          <Box sx={{ mb: 3 }}>
            {title && (
              <Typography variant="h6" fontWeight={600}>
                {title}
              </Typography>
            )}
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
        )}
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke={theme.palette.text.secondary} />
            <YAxis tick={{ fontSize: 12 }} stroke={theme.palette.text.secondary} />
            <Tooltip
              contentStyle={{
                backgroundColor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 8,
              }}
            />
            <Legend />
            <Bar dataKey="current" fill={theme.palette.primary.main} name="Current Stock" radius={[4, 4, 0, 0]} />
            <Bar dataKey="min" fill={alpha(theme.palette.warning.main, 0.5)} name="Min Stock" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
