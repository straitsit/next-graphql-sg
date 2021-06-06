import withRedux from 'next-redux-wrapper';
import { Provider } from 'react-redux';
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';
import '../styles/globals.css';
import { useStickyState, useStickyStateBase } from '../utils/stickyState';
import store from '../store';
import Navbar from '../components/Navbar';

function DataApp({ Component, pageProps, store }) {
  const now = new Date();

  const [lsexp, setLsexp] = useStickyStateBase(now.getTime(), 'lsexp');
  const [authToken, _] = useStickyState('', 'authToken', lsexp, setLsexp);

  const client = new ApolloClient({
    uri: 'https://sheet-cms.genexist.com/graphql',
    headers: {
      Authorization: authToken ? `Bearer ${authToken}` : ''
    },
    cache: new InMemoryCache(),
  });

  return (
      <>
        <ApolloProvider client={client}>
          <Provider store={store}>
            <Component {...pageProps} />
          </Provider>
        </ApolloProvider>
      </>
  );
}

DataApp.getInitialProps = async ({ Component, ctx }) => {
  const pageProps = Component.getInitialProps
    ? await Component.getInitialProps(ctx)
    : {};
  return { pageProps };
};

export default withRedux(store)(DataApp);
