import { useMutation } from '@apollo/client';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setUser } from '../actions/user_action';
import { M_LOGIN } from '../constants/gql';
import { RootState } from '../reducers';

const Login = props => {
    const [values, setValues] = useState({ identifier: '', password: '' });
    const dispatch = useDispatch();
    // const user = useSelector((state: RootState) => state.user);

    const [g_login] = useMutation(M_LOGIN);

    const onLogin = async (e) => {
        e.preventDefault();
        try {
            let result = await g_login({ variables: { obj: values } });
            dispatch(setUser({ jwt: result.data.login.jwt, username: result.data.login.user.username }));
            localStorage.setItem('authToken', result.data.login.jwt);
            location.reload();
        } catch (err) {
            console.log(err);
        }
    }

    const handleChange = (prop) => (event) => { setValues({ ...values, [prop]: event.target.value }); };

    return (
        <div className="container mx-auto">
            <div className="text-4xl mx-9 mt-9 mb-9">Login</div>
            {/* <h3>testuser@testuser.com</h3> */}
            {/* <h3>1234qwer</h3> */}
            <form className="mx-9 mt-2" onSubmit={onLogin}>
                <div>
                    <label htmlFor="identifier" className="block text-sm font-medium text-gray-700">
                        Identifier
                    </label>
                    <div className="mt-1">
                        <input
                            type="text"
                            name="identifier"
                            id="identifier"
                            value={values.identifier} onChange={handleChange('identifier')}
                            className="p-2 w-1/4 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block sm:text-sm border border-gray-300 rounded-md"
                            placeholder="you@example.com"
                        />
                    </div>
                </div>
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                        Password
                    </label>
                    <div className="mt-1">
                        <input
                            type="text"
                            name="password"
                            id="password"
                            value={values.password} onChange={handleChange('password')}
                            className="p-2 w-1/4 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block sm:text-sm border border-gray-300 rounded-md"
                            placeholder="you@example.com"
                        />
                    </div>
                </div>
                <button type="submit" className="mt-8 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Submit</button>
            </form>
        </div>
    )
}

export default Login;
