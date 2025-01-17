import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const COURSE_PURCHASE_API = "http://localhost:8080/api/v1/purchase";

export const purchaseApi = createApi({
  reducerPath: "purchaseApi",
  baseQuery: fetchBaseQuery({
    baseUrl: COURSE_PURCHASE_API,
    credentials: "include",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Purchase"],
  endpoints: (builder) => ({
    createCheckoutSession: builder.mutation({
      query: ({ courseId }) => ({
        
        url: "/checkout/create-order",
        method: "POST",
        body: { courseId },
      }),
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          console.log("createCheckoutSession:", data);

          if (data?.url) {
            window.location.href = data.url;
          } else {
            throw new Error("No checkout URL received");
          }
        } catch (error) {
          console.error("Checkout session creation failed:", error);
          if (error.originalStatus === 404) {
            console.error("Endpoint not found. Please check the URL.");
          } else if (error.status === "PARSING_ERROR") {
            console.error("Response is not valid JSON:", error.data);
          } else {
            console.error("Unexpected error:", error);
          }
        }
      },
    }),
    getCourseDetailWithStatus: builder.query({
      query: (courseId) => ({
        url: `/course/${courseId}/detail-with-status`,
        method: "GET",
      }),
      providesTags: ["Purchase"],
    }),
    getPurchasedCourses: builder.query({
      query: () => ({
        url: "/",
        method: "GET",
      }),
      providesTags: ["Purchase"],
    }),
  }),
});

export const {
  useCreateCheckoutSessionMutation,
  useGetCourseDetailWithStatusQuery,
  useGetPurchasedCoursesQuery,
} = purchaseApi;
