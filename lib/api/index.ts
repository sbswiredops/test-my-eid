import authApi from "./auth"
import productsApi from "./products"
import categoriesApi from "./categories"
import bannersApi from "./banners"
import ordersApi from "./orders"
import settingsApi from "./settings"

export const api = {
  auth: authApi,
  products: productsApi,
  categories: categoriesApi,
  banners: bannersApi,
  orders: ordersApi,
  settings: settingsApi,
}

export default api
