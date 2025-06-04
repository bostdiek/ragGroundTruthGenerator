/**
 * Collections Routes
 *
 * This file defines all the routes for the collections feature.
 */

import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';

// Import the page components lazily for code splitting
const CollectionsPage = lazy(() => import('../pages/Collections'));
const CollectionDetailPage = lazy(() => import('../pages/CollectionDetail'));
const CreateCollectionPage = lazy(() => import('../pages/CreateCollection'));

/**
 * Collection routes configuration
 */
export const collectionsRoutes: RouteObject[] = [
  {
    path: 'collections',
    children: [
      {
        index: true,
        element: <CollectionsPage />,
      },
      {
        path: 'new',
        element: <CreateCollectionPage />,
      },
      {
        path: ':collectionId',
        element: <CollectionDetailPage />,
      },
    ],
  },
];

export default collectionsRoutes;
