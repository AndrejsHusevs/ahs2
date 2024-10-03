import React, { useState } from 'react';
import { ApolloClient, InMemoryCache, ApolloProvider, useQuery, gql, useLazyQuery } from '@apollo/client';
import config from '../config';

const client = new ApolloClient({
  uri: config.graphqlEndpoint,
  cache: new InMemoryCache()
});

const initialQuery = `
{
  product(id: "apple-imac-2021") {
    id
    name
    gallery
    price_amount
    price_currency_symbol
    description
    attributes {
      id
      name
      items {
        id
        display_value
      }
    }
  }
}
`;

function GraphQLTest() {
  const [query, setQuery] = useState(initialQuery);
  const [executeQuery, { loading, error, data }] = useLazyQuery(gql`${query}`);

  const handleSubmit = (event) => {
    event.preventDefault();
    executeQuery();
  };

  return (
    <div>
      <h1>GraphQL TESTING PAGE</h1>
      <form id="graphqlForm" onSubmit={handleSubmit}>
        <textarea
          id="queryInput"
          name="query"
          rows="10"
          cols="80"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <br />
        <input type="submit" value="Send Query" />
      </form>
      <hr />
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error.message}</p>}
      <div id="responseOutput">Data: <pre>{JSON.stringify(data, null, 2)}</pre></div>
    </div>
  );
}

function GraphQLTestPage() {
  return (
    <ApolloProvider client={client}>
      <GraphQLTest />
    </ApolloProvider>
  );
}

export default GraphQLTestPage;