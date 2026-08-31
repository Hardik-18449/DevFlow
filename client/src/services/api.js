import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/v1',
    credentials: 'include',
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.accessToken;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Auth', 'Organization', 'Project', 'Task', 'Comment', 'Notification', 'Activity'],
  endpoints: (builder) => ({
    // Auth Endpoints
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['Auth', 'Organization'],
    }),
    register: builder.mutation({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['Auth'],
    }),
    refreshToken: builder.mutation({
      query: () => ({
        url: '/auth/refresh',
        method: 'POST',
      }),
    }),
    forgotPassword: builder.mutation({
      query: (data) => ({
        url: '/auth/forgot-password',
        method: 'POST',
        body: data,
      }),
    }),
    resetPassword: builder.mutation({
      query: (data) => ({
        url: '/auth/reset-password',
        method: 'POST',
        body: data,
      }),
    }),
    getMe: builder.query({
      query: () => '/users/me',
      providesTags: ['Auth'],
    }),

    // Organization Endpoints
    getOrganizations: builder.query({
      query: () => '/organizations',
      providesTags: ['Organization'],
    }),
    createOrganization: builder.mutation({
      query: (data) => ({
        url: '/organizations',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Organization'],
    }),
    getOrgMembers: builder.query({
      query: (orgId) => `/organizations/${orgId}/members`,
      providesTags: ['Organization'],
    }),
    inviteOrgMember: builder.mutation({
      query: ({ orgId, email, role }) => ({
        url: `/organizations/${orgId}/invitations`,
        method: 'POST',
        body: { email, role },
      }),
      invalidatesTags: ['Organization'],
    }),

    // Project Endpoints
    getProjects: builder.query({
      query: ({ orgId, search, status, priority }) => {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (status) params.append('status', status);
        if (priority) params.append('priority', priority);
        return `/organizations/${orgId}/projects?${params.toString()}`;
      },
      providesTags: ['Project'],
    }),
    getProject: builder.query({
      query: (projectId) => `/projects/${projectId}`,
      providesTags: (result, error, id) => [{ type: 'Project', id }],
    }),
    createProject: builder.mutation({
      query: ({ orgId, data }) => ({
        url: `/organizations/${orgId}/projects`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Project'],
    }),
    getProjectDashboard: builder.query({
      query: (projectId) => `/projects/${projectId}/dashboard`,
      providesTags: ['Project', 'Task'],
    }),
    getProjectMembers: builder.query({
      query: (projectId) => `/projects/${projectId}/members`,
      providesTags: ['Project'],
    }),
    addProjectMember: builder.mutation({
      query: ({ projectId, userId, role }) => ({
        url: `/projects/${projectId}/members`,
        method: 'POST',
        body: { userId, role },
      }),
      invalidatesTags: ['Project'],
    }),
    removeProjectMember: builder.mutation({
      query: ({ projectId, userId }) => ({
        url: `/projects/${projectId}/members/${userId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Project'],
    }),

    // Task Endpoints
    getTasks: builder.query({
      query: ({ projectId, status, priority, search, assignee }) => {
        const params = new URLSearchParams();
        if (status) params.append('status', status);
        if (priority) params.append('priority', priority);
        if (search) params.append('search', search);
        if (assignee) params.append('assignee', assignee);
        return `/projects/${projectId}/tasks?${params.toString()}`;
      },
      providesTags: ['Task'],
    }),
    getTask: builder.query({
      query: (taskId) => `/tasks/${taskId}`,
      providesTags: (result, error, id) => [{ type: 'Task', id }],
    }),
    createTask: builder.mutation({
      query: ({ projectId, data }) => ({
        url: `/projects/${projectId}/tasks`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Task', 'Project', 'Activity'],
    }),
    updateTask: builder.mutation({
      query: ({ taskId, data }) => ({
        url: `/tasks/${taskId}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Task', 'Project', 'Activity'],
    }),
    updateTaskStatus: builder.mutation({
      query: ({ taskId, status }) => ({
        url: `/tasks/${taskId}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: ['Task', 'Project', 'Activity'],
    }),
    deleteTask: builder.mutation({
      query: (taskId) => ({
        url: `/tasks/${taskId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Task', 'Project', 'Activity'],
    }),

    // Comment Endpoints
    getComments: builder.query({
      query: (taskId) => `/tasks/${taskId}/comments`,
      providesTags: ['Comment'],
    }),
    createComment: builder.mutation({
      query: ({ taskId, content, parentCommentId }) => ({
        url: `/tasks/${taskId}/comments`,
        method: 'POST',
        body: { content, parentCommentId },
      }),
      invalidatesTags: ['Comment', 'Activity'],
    }),

    // Activity & Notification Endpoints
    getProjectActivities: builder.query({
      query: (projectId) => `/projects/${projectId}/activities`,
      providesTags: ['Activity'],
    }),
    getNotifications: builder.query({
      query: () => '/notifications',
      providesTags: ['Notification'],
    }),
    markAllNotificationsRead: builder.mutation({
      query: () => ({
        url: '/notifications/read-all',
        method: 'PATCH',
      }),
      invalidatesTags: ['Notification'],
    }),

    // Search Endpoint
    search: builder.query({
      query: ({ q, orgId, type }) => `/search?q=${encodeURIComponent(q)}&organizationId=${orgId || ''}&type=${type || 'all'}`,
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useRefreshTokenMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useGetMeQuery,
  useGetOrganizationsQuery,
  useCreateOrganizationMutation,
  useGetOrgMembersQuery,
  useInviteOrgMemberMutation,
  useGetProjectsQuery,
  useGetProjectQuery,
  useCreateProjectMutation,
  useGetProjectDashboardQuery,
  useGetProjectMembersQuery,
  useAddProjectMemberMutation,
  useRemoveProjectMemberMutation,
  useGetTasksQuery,
  useGetTaskQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useUpdateTaskStatusMutation,
  useDeleteTaskMutation,
  useGetCommentsQuery,
  useCreateCommentMutation,
  useGetProjectActivitiesQuery,
  useGetNotificationsQuery,
  useMarkAllNotificationsReadMutation,
  useLazySearchQuery,
} = api;
