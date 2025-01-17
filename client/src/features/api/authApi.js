import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  userLoggedIn,
  userLoggedOut,
  setError,
  setLoading,
} from "../authSlice";

const USER_API = "http://localhost:8080/api/v1/user/";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl: USER_API,
    credentials: "include", // This handles cookies
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    }
  }),
  tagTypes: ["User"],
  endpoints: (builder) => ({
    registerUser: builder.mutation({
      query: (inputData) => ({
        url: "register",
        method: "POST",
        body: inputData,
      }),
      async onQueryStarted(_, { queryFulfilled, dispatch }) {
        dispatch(setLoading(true));
        try {
          const result = await queryFulfilled;
          localStorage.setItem('token', result.data.token);
          dispatch(userLoggedIn({ user: result.data.user }));
        } catch (error) {
          dispatch(
            setError(error.error?.data?.message || "Registration failed")
          );
        } finally {
          dispatch(setLoading(false));
        }
      },
      invalidatesTags: ["User"],
    }),

    loginUser: builder.mutation({
      query: (inputData) => ({
        url: "login",
        method: "POST",
        body: inputData,
      }),
      async onQueryStarted(_, { queryFulfilled, dispatch }) {
        dispatch(setLoading(true));
        try {
          const result = await queryFulfilled;
          localStorage.setItem('token', result.data.token);
          dispatch(userLoggedIn({ user: result.data.user }));
        } catch (error) {
          dispatch(setError(error.error?.data?.message || "Login failed"));
        } finally {
          dispatch(setLoading(false));
        }
      },
      invalidatesTags: ["User"],
    }),

    logoutUser: builder.mutation({
      query: () => ({
        url: "logout",
        method: "GET",
      }),
      async onQueryStarted(_, { queryFulfilled, dispatch }) {
        try {
          await queryFulfilled;
          localStorage.removeItem('token');
          dispatch(userLoggedOut());
        } catch (error) {
          dispatch(setError(error.error?.data?.message || "Logout failed"));
        }
      },
      invalidatesTags: ["User"],
    }),

    loadUser: builder.query({
      query: () => ({
        url: "profile",
        method: "GET",
      }),
      async onQueryStarted(_, { queryFulfilled, dispatch }) {
        dispatch(setLoading(true));
        try {
          const result = await queryFulfilled;
          dispatch(userLoggedIn({ user: result.data.user }));
        } catch (error) {
          if (error.error?.status !== 401) {
            dispatch(
              setError(error.error?.data?.message || "Failed to load user")
            );
          }
        } finally {
          dispatch(setLoading(false));
        }
      },
      providesTags: ["User"],
      // Skip query if no token is present
      skip: () => !localStorage.getItem('token'),
    }),

    updateUser: builder.mutation({
      query: (formData) => ({
        url: "profile/update",
        method: "PUT",
        body: formData,
      }),
      async onQueryStarted(_, { queryFulfilled, dispatch }) {
        dispatch(setLoading(true));
        try {
          const result = await queryFulfilled;
          dispatch(userLoggedIn({ user: result.data.user }));
        } catch (error) {
          dispatch(setError(error.error?.data?.message || "Update failed"));
        } finally {
          dispatch(setLoading(false));
        }
      },
      invalidatesTags: ["User"],
    }),
  }),
});

export const {
  useRegisterUserMutation,
  useLoginUserMutation,
  useLogoutUserMutation,
  useLoadUserQuery,
  useUpdateUserMutation,
} = authApi;
