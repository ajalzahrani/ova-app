"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"

const data = [
  {
    name: "Jan",
    total: 5,
  },
  {
    name: "Feb",
    total: 3,
  },
  {
    name: "Mar",
    total: 7,
  },
  {
    name: "Apr",
    total: 4,
  },
  {
    name: "May",
    total: 8,
  },
  {
    name: "Jun",
    total: 6,
  },
  {
    name: "Jul",
    total: 9,
  },
  {
    name: "Aug",
    total: 10,
  },
  {
    name: "Sep",
    total: 8,
  },
  {
    name: "Oct",
    total: 12,
  },
  {
    name: "Nov",
    total: 10,
  },
  {
    name: "Dec",
    total: 7,
  },
]

export function Overview() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
        <Bar dataKey="total" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-primary" />
      </BarChart>
    </ResponsiveContainer>
  )
}
