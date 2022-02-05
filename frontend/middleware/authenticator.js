export default async ({ $auth, store, route, redirect }) => {
  console.log(route)
  // 未ログイン時はログインページへ redirect
  if (!$auth.loggedIn && route.path !== '/login') {
    return redirect('/login')
  }
}
