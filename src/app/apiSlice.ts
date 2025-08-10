// app/apiSlice.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  endpoints: (builder) => ({
    getDashboardStats: builder.query({
      query: () => 'dashboard/stats',
    }),
    getRecentOrders: builder.query({
      query: () => 'orders/recent',
    }),
    // Thêm các endpoints khác tại đây
  }),
});

export const { 
  useGetDashboardStatsQuery,
  useGetRecentOrdersQuery 
} = apiSlice;