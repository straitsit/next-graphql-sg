import { NextPageContext } from 'next';
import App from 'next/app';
import withRedux from 'next-redux-wrapper';
import { Provider } from 'react-redux';
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';
import '../styles/globals.css';

import store, { Store } from '../store';
import Navbar from '../components/Navbar';

interface AppContext extends NextPageContext {
  store: Store;
}

class MyApp extends App<AppContext> {
  constructor(props) {
    super(props);
    this.state = {
      authToken: ''
    }    
  }

  componentDidMount() {
    this.setState({
      authToken: localStorage.getItem('authToken') || ''
    })
  }

  render() {
    const { store, Component, ...props } = this.props;
    
    // const authToken = localStorage.getItem('authToken');
    // if(authToken)

    const client = new ApolloClient({
      uri: 'https://sheet-cms.genexist.com/graphql',
      headers: {
        Authorization: this.state.authToken ? `Bearer ${this.state.authToken}` : ''
      },
      cache: new InMemoryCache(),
    });

    // console.log(this.state.authToken);

    return (
      <>
        <ApolloProvider client={client}>
          <Provider store={store}>
            <Navbar />
            <Component {...props} />
          </Provider>
        </ApolloProvider>
      </>
    );
  }
}

export default withRedux(store)(MyApp);
