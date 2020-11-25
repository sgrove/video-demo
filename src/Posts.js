
/* Posts.js */
import React, {Suspense} from 'react';
import {ErrorBoundary} from "react-error-boundary";
import {useLazyLoadQuery} from 'react-relay/hooks';
import { auth } from './Config';
import {ErrorFallback, stringifyRelayData, LocationNote, updateFormVariables} from './utils';
import graphql from 'babel-plugin-relay/macro';
import {createPaginationContainer} from 'react-relay';
import Post from './Post'


export function PaginatedRepositoryIssues(props) {
  const {relay, repositoryForPaginatedIssues} = props;
  const [isLoading, setIsLoading] = React.useState(false);

  const postUses = repositoryForPaginatedIssues?.posts?.edges?.map((item, idx) => <Post key={item?.post?.id || idx} issue={item?.post} />);

  const loadMoreCount = 2;

  return (
    <div>
      <h4>PostUses <LocationNote /></h4>
      {postUses}
      <button
        className={isLoading ? "loading" : null}
        disabled={!relay.hasMore()}
        onClick={() => {
          if (!relay.isLoading()) {
            setIsLoading(true);
            relay.loadMore(loadMoreCount, (results) => {
              console.log("Loaded more posts: ", results);
              setIsLoading(false);
            });
          }
        }}>
        {isLoading ? 'Loading more posts...' :  relay.hasMore() ? `Fetch ${loadMoreCount} more posts` : "All posts have been fetched"}
      </button>
    </div>
  );
}

export const PaginatedRepositoryIssuesContainer = createPaginationContainer(
  PaginatedRepositoryIssues,
  {
    repositoryForPaginatedIssues: graphql`fragment Posts_repositoryForPaginatedIssues on GitHubRepository @argumentDefinitions(count: {type: "Int", defaultValue: 10}, cursor: {type: "String"}, createdBy: {type: "String"}) {
  id
  posts: issues(first: $count, orderBy: {field: CREATED_AT, direction: DESC}, filterBy: {createdBy: $createdBy}, labels: "Publish", after: $cursor) @connection(key: "Posts_repositoryForPaginatedIssues_posts") {
    edges {
      post: node {
        ...Post_fragment
      }
    }
  }
  oneGraphId
}`,
  },
  {
    direction: 'forward',
    getConnectionFromProps(props) {
      return props?.repositoryForPaginatedIssues?.posts;
    },
    getVariables(props, pagination, fragmentVariables) {
      const {count, cursor} = pagination;
      return {...fragmentVariables, count: count, cursor: cursor, oneGraphId: props?.repositoryForPaginatedIssues?.oneGraphId};
    },
    query: graphql`query Posts_PaginatedRepositoryIssuesContainerQuery($oneGraphId: ID!, $createdBy: String = "sgrove", $count: Int = 10, $cursor: String) {
  oneGraphNode(oneGraphId: $oneGraphId) {
    oneGraphId
    ...Posts_repositoryForPaginatedIssues @arguments(count: $count, cursor: $cursor, createdBy: $createdBy)
  }
}`
  }
);

const POSTS_QUERY = graphql`
  query PostsQuery($createdBy: String = "sgrove") {
    gitHub {
      repository(name: "essay.dev", owner: "onegraph") {
        id
        description
        name
        ...Posts_repositoryForPaginatedIssues @arguments(createdBy: $createdBy)
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

  const paginatedRepositoryIssuesUses = <PaginatedRepositoryIssuesContainer  repositoryForPaginatedIssues={data?.gitHub?.repository} />;

  return (
    <div>
      {dataEl}
            <h4>PaginatedRepositoryIssuesUses <LocationNote /></h4>
      {paginatedRepositoryIssuesUses}
    </div>
  );
}

export default function PostsQueryForm(props) {
  const [queryVariables, setQueryVariables] = React.useState({...props});
  const [formVariables, setFormVariables] = React.useState({});
  const [hasError, setHasError] = React.useState(false);

  const formEl = (
  <form onSubmit={event => { event.preventDefault(); setQueryVariables({ ...formVariables }) }}>
    <label htmlFor="createdBy">createdBy</label><input id="createdBy" type="text" onChange={updateFormVariables(setFormVariables, ["createdBy"], (value) => value)} />
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
