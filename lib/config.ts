export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  API_VERSION: 'v1',
  ENDPOINTS: {
    // Auth (6 endpoints)
    AUTH_REGISTER: '/auth/register',
    AUTH_REGISTER_ADMIN: '/auth/register-admin',
    AUTH_LOGIN: '/auth/login',
    AUTH_REFRESH: '/auth/refresh',
    AUTH_PROFILE: '/auth/profile',
    AUTH_LOGOUT: '/auth/logout',

    // Users (5 endpoints)
    USERS_PROFILE: '/users/profile', // GET
    USERS_UPDATE_PROFILE: '/users/profile', // PATCH
    USERS_DELETE_PROFILE: '/users/profile', // DELETE
    USERS: '/users', // GET (Admin only)
    USER_BY_ID: (id: string) => `/users/${id}`, // GET (Admin only)

    // Categories (6 endpoints)
    CATEGORIES_CREATE: '/categories', // POST (Admin only)
    CATEGORIES: '/categories', // GET
    CATEGORY_BY_ID: (id: string) => `/categories/${id}`, // GET
    CATEGORY_UPDATE: (id: string) => `/categories/${id}`, // PATCH (Admin only)
    CATEGORY_DELETE: (id: string) => `/categories/${id}`, // DELETE (Admin only)
    CATEGORY_BY_SLUG: (slug: string) => `/categories/slug/${slug}`, // GET

    // Products (6 endpoints)
    PRODUCTS_CREATE: '/products', // POST (Admin only)
    PRODUCTS: '/products', // GET with pagination and filters
    PRODUCT_BY_ID: (id: string) => `/products/${id}`, // GET
    PRODUCT_UPDATE: (id: string) => `/products/${id}`, // PATCH (Admin only)
    PRODUCT_DELETE: (id: string) => `/products/${id}`, // DELETE (Admin only)
    PRODUCT_BY_SLUG: (slug: string) => `/products/slug/${slug}`, // GET
    // Product sizes (5 endpoints)
    PRODUCT_SIZE_CREATE: '/products/size', // POST (Admin only)
    PRODUCT_SIZE_UPDATE: (id: string) => `/products/size/${id}`, // PATCH (Admin only)
    PRODUCT_SIZE_BY_ID: (id: string) => `/products/size/${id}`, // GET
    PRODUCT_SIZE_DELETE: (id: string) => `/products/size/${id}`, // DELETE (Admin only)
    PRODUCT_SIZES: '/products/sizes', // GET

    // Cart (6 endpoints)
    CART_ADD: '/cart/add', // POST
    CART: '/cart', // GET
    CART_CLEAR: '/cart', // DELETE
    CART_COUNT: '/cart/count', // GET
    CART_UPDATE: '/cart/update', // PATCH
    CART_REMOVE_ITEM: (cartItemId: string) => `/cart/${cartItemId}`, // DELETE

    // Orders (8 endpoints)
    ORDERS_CREATE: '/orders', // POST
    ORDERS: '/orders', // GET (Admin only)
    ORDERS_MY: '/orders/my', // GET
    ORDERS_MY_STATS: '/orders/my/stats', // GET
    ORDER_BY_ID: (id: string) => `/orders/${id}`, // GET
    ORDER_BY_ORDER_ID: (orderId: string) => `/orders/order-id/${orderId}`, // GET
    ORDER_UPDATE_STATUS: (id: string) => `/orders/${id}/status`, // PATCH (Admin only)
    ORDER_CANCEL: (id: string) => `/orders/${id}/cancel`, // POST

    // Admin (6 endpoints)
    ADMIN_DASHBOARD: '/admin/dashboard', // GET
    ADMIN_USERS: '/admin/users', // GET with pagination
    ADMIN_UPDATE_USER_ROLE: (userId: string) => `/admin/users/${userId}/role`, // PATCH
    ADMIN_DELETE_USER: (userId: string) => `/admin/users/${userId}`, // DELETE
    ADMIN_LOW_STOCK_PRODUCTS: '/admin/products/low-stock', // GET
    ADMIN_ORDERS_DATE_RANGE: '/admin/orders/date-range', // GET

    // FAQs (17 endpoints)
    FAQS: '/faqs', // GET with filters and pagination
    FAQS_CREATE: '/faqs', // POST
    FAQ_BY_ID: (id: string) => `/faqs/${id}`, // GET (optionally increment viewCount)
    FAQ_UPDATE: (id: string) => `/faqs/${id}`, // PATCH
    FAQ_DELETE: (id: string) => `/faqs/${id}`, // DELETE
    FAQS_BY_PRODUCT: (productId: string) => `/faqs/product/${productId}`, // GET
    FAQS_BY_CATEGORY: (categoryId: string) => `/faqs/category/${categoryId}`, // GET
    FAQS_SEARCH: '/faqs/search', // POST
    FAQ_FEEDBACK: (id: string) => `/faqs/${id}/feedback`, // POST
    FAQS_POPULAR: '/faqs/popular', // GET
    FAQS_BY_TYPE: (type: string) => `/faqs/type/${type}`, // GET
    FAQS_STATISTICS: '/faqs/statistics', // GET
    FAQS_RELATED: (id: string) => `/faqs/${id}/related`, // GET
    FAQS_REMOVE: '/faqs/remove', // POST
    FAQS_REORDER: '/faqs/reorder', // POST
    FAQS_BULK: '/faqs/bulk', // POST
    FAQ_RESTORE: (id: string) => `/faqs/${id}/restore`, // POST

    // Homecategory (5 endpoints)
    HOMECATEGORY_CREATE: '/homecategory', // POST
    HOMECATEGORY: '/homecategory', // GET
    HOMECATEGORY_BY_ID: (id: string) => `/homecategory/${id}`, // GET
    HOMECATEGORY_UPDATE: (id: string) => `/homecategory/${id}`, // PUT
    HOMECATEGORY_DELETE: (id: string) => `/homecategory/${id}`, // DELETE

    // Herobanner Main (5 endpoints)
    HEROBANNER_CREATE: '/herobanner', // POST
    HEROBANNER: '/herobanner', // GET
    HEROBANNER_BY_ID: (id: string) => `/herobanner/${id}`, // GET
    HEROBANNER_UPDATE: (id: string) => `/herobanner/${id}`, // PUT
    HEROBANNER_DELETE: (id: string) => `/herobanner/${id}`, // DELETE

    // Herobanner Active toggles (PUT)
    HEROBANNER_SET_ACTIVE: (id: string) => `/herobanner/${id}/active`, // PUT
    HEROBANNER_BOTTOM_SET_ACTIVE: (id: string) => `/herobanner/bottom/${id}/active`, // PUT
    HEROBANNER_MIDDLE_SET_ACTIVE: (id: string) => `/herobanner/middle/${id}/active`, // PUT
    HEROBANNER_GIVE_SET_ACTIVE: (id: string) => `/herobanner/give/${id}/active`, // PUT

    // Herobanner Bottom (5 endpoints)
    HEROBANNER_BOTTOM_CREATE: '/herobanner/bottom', // POST
    HEROBANNER_BOTTOM: '/herobanner/bottom', // GET
    HEROBANNER_BOTTOM_BY_ID: (id: string) => `/herobanner/bottom/${id}`, // GET
    HEROBANNER_BOTTOM_UPDATE: (id: string) => `/herobanner/bottom/${id}`, // PUT
    HEROBANNER_BOTTOM_DELETE: (id: string) => `/herobanner/bottom/${id}`, // DELETE

    // Herobanner Middle (5 endpoints)
    HEROBANNER_MIDDLE_CREATE: '/herobanner/middle', // POST
    HEROBANNER_MIDDLE: '/herobanner/middle', // GET
    HEROBANNER_MIDDLE_BY_ID: (id: string) => `/herobanner/middle/${id}`, // GET
    HEROBANNER_MIDDLE_UPDATE: (id: string) => `/herobanner/middle/${id}`, // PUT
    HEROBANNER_MIDDLE_DELETE: (id: string) => `/herobanner/middle/${id}`, // DELETE

    // Herobanner Give (5 endpoints)
    HEROBANNER_GIVE_CREATE: '/herobanner/give', // POST
    HEROBANNER_GIVE: '/herobanner/give', // GET
    HEROBANNER_GIVE_BY_ID: (id: string) => `/herobanner/give/${id}`, // GET
    HEROBANNER_GIVE_UPDATE: (id: string) => `/herobanner/give/${id}`, // PUT
    HEROBANNER_GIVE_DELETE: (id: string) => `/herobanner/give/${id}`, // DELETE

    // StoreSettings (2 endpoints)
    SETTINGS_GET: '/settings', // GET
    SETTINGS_UPDATE: '/settings', // POST
  },
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 100,
  },
  UPLOAD: {
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
    ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/webm'],
  },
};