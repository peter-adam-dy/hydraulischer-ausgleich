import { createBrowserRouter, Navigate } from 'react-router';
import { AppLayout } from '../components/layout/AppLayout.tsx';
import { ProjectListPage } from '../features/projects/ProjectListPage.tsx';
import { ProjectCreatePage } from '../features/projects/ProjectCreatePage.tsx';
import { ProjectDashboardPage } from '../features/projects/ProjectDashboardPage.tsx';
import { BuildingSettingsPage } from '../features/building/BuildingSettingsPage.tsx';
import { RoomListPage } from '../features/rooms/RoomListPage.tsx';
import { RoomEditPage } from '../features/rooms/RoomEditPage.tsx';
import { RadiatorListPage } from '../features/radiators/RadiatorListPage.tsx';
import { RadiatorEditPage } from '../features/radiators/RadiatorEditPage.tsx';
import { SystemSettingsPage } from '../features/system/SystemSettingsPage.tsx';
import { PipesPage } from '../features/pipes/PipesPage.tsx';
import { ResultsPage } from '../features/results/ResultsPage.tsx';
import { ServicePage } from '../features/service/ServicePage.tsx';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <ProjectListPage /> },
      { path: 'settings', element: <ServicePage /> },
      { path: 'project/new', element: <ProjectCreatePage /> },
      { path: 'project/:projectId', element: <ProjectDashboardPage /> },
      { path: 'project/:projectId/edit', element: <ProjectCreatePage /> },
      { path: 'project/:projectId/building', element: <BuildingSettingsPage /> },
      { path: 'project/:projectId/rooms', element: <RoomListPage /> },
      { path: 'project/:projectId/rooms/new', element: <RoomEditPage /> },
      { path: 'project/:projectId/rooms/:roomId', element: <RoomEditPage /> },
      { path: 'project/:projectId/radiators', element: <RadiatorListPage /> },
      { path: 'project/:projectId/radiators/new', element: <RadiatorEditPage /> },
      { path: 'project/:projectId/radiators/:radiatorId', element: <RadiatorEditPage /> },
      { path: 'project/:projectId/system', element: <SystemSettingsPage /> },
      { path: 'project/:projectId/pipes', element: <PipesPage /> },
      { path: 'project/:projectId/results', element: <ResultsPage /> },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);
