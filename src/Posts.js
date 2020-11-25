
/* Posts.js */
import React, {Suspense} from 'react';
import {ErrorBoundary} from "react-error-boundary";
import {useLazyLoadQuery} from 'react-relay/hooks';
import { auth } from './Config';
import {ErrorFallback, stringifyRelayData, LocationNote} from './utils';
import graphql from 'babel-plugin-relay/macro';


const POSTS_QUERY = graphql`
  query Posts_PostsQuery {
    gitHub {
      repository(name: "essay.dev", owner: "onegraph") {
        id
        description
        name
      }
    }
  }
`;

export function PostsQuery(props) {
  const data = useLazyLoadQuery(POSTS_QUERY, props,
  {
    // Try to render from the store if we have some data available, but also refresh from the network
    fetchPolicy: "store-and-network",
    // Refetch the query if we've logged in/out of any service
    fetchKey: auth.accessToken()?.accessToken,
  });

const dataEl = data ? (
    <div className="data-box">
      <h3>Data for Posts <LocationNote /></h3>
      <pre>{stringifyRelayData(data)}</pre>
    </div>
  ) : null;

  

  return (
    <div>
      {dataEl}
            
    </div>
  );
}

export default function PostsQueryForm(props) {
  const [queryVariables, setQueryVariables] = React.useState({...props});
  const [formVariables] = React.useState({});
  const [hasError, setHasError] = React.useState(false);

  const formEl = (
  <form onSubmit={event => { event.preventDefault(); setQueryVariables({ ...formVariables }) }}>
    
    <input type="submit" />
  </form>
  );

  /** If there's an error in the query component (Missing authentication, missing variable, CORS error, etc.)
      we'll let the ErrorBoundary handle the 'try again' action */
  const actionButtonEl = hasError ? null : (
    <button onClick={() => setQueryVariables({ ...formVariables })}>
      Run PostsQuery
    </button>
  );

  return (
    <div>
      <h3>Posts</h3>
      {formEl}
      {actionButtonEl}
      <ErrorBoundary
        FallbackComponent={ErrorFallback}
        onReset={() => {
          // reset the state of your app so the error doesn't happen again
          console.log("Reset queryVariables to trigger query run");
          setHasError(false);
          setQueryVariables({ ...props, ...formVariables });
        }}
        onError={(err) => {
          setHasError(true);
          console.log("Error detected:", err);
        }}>
        <Suspense fallback={"Loading PostsQuery..."}>
          <PostsQuery {...queryVariables} />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
