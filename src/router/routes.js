export default [
  {
    path: '/',
    component: () => import('layouts/default'),
    children: [
      { path: '', component: () => import('pages/PageFindFiles') },
      { path: 'find-files', component: () => import('pages/PageFindFiles') },
      { path: 'results', component: () => import('pages/PageResults') }
    ]
  },

  {
    // Always leave this as last one
    path: '*',
    component: () => import('pages/404')
  }
]
