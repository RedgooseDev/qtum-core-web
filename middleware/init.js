import * as lib from '../lib';


export default function(cox)
{
	const { store, redirect, route, req, isDev } = cox;

	// print current route
	if (cox.isDev)
	{
		console.log(`REDIRECT TO : ${route.name} :: ${route.path}`);
	}

	// check auth
	if (store.state.system.useAuth && !store.state.system.hash)
	{
		// `NOT_ALLOW`값이 all이라면 무조건 로그인 페이지로 보내버린다.
		if (lib.object.findKeyInArray(store.state.system.notAllow, 'all'))
		{
			redirect('/auth/login');
		}

		// 허용되지않은 `route.name`값을 검사하여 로그인으로 이동
		if (lib.object.findKeyInArray(store.state.system.notAllow, route.name))
		{
			redirect('/auth/login');
		}
	}

	// check on qtum-core
	if (!store.state.status.core)
	{
		redirect('/off-core');
	}

	if (process.server)
	{

	}
	else
	{
		// 브라우저에서 이동
	}
}