
/* Post.js */
import React from 'react';
import graphql from 'babel-plugin-relay/macro';
import {useFragment} from 'react-relay/hooks';
import {stringifyRelayData, LocationNote} from './utils';
import {createPaginationContainer} from 'react-relay';
import Comment from './Comment'
import Author from './Author'

export function PaginatedIssueComments(props) {
  const {relay, issueForPaginatedComments} = props;
  const [isLoading, setIsLoading] = React.useState(false);

  const commentUses = issueForPaginatedComments?.comments?.edges?.map((item, idx) => <Comment key={item?.node?.id || idx} comment={item?.node} />);

  const loadMoreCount = 2;

  return (
    <div>
      <h4>CommentUses <LocationNote /></h4>
      {commentUses}
      <button
        className={isLoading ? "loading" : null}
        disabled={!relay.hasMore()}
        onClick={() => {
          if (!relay.isLoading()) {
            setIsLoading(true);
            relay.loadMore(loadMoreCount, (results) => {
              console.log("Loaded more comments: ", results);
              setIsLoading(false);
            });
          }
        }}>
        {isLoading ? 'Loading more comments...' :  relay.hasMore() ? `Fetch ${loadMoreCount} more comments` : "All comments have been fetched"}
      </button>
    </div>
  );
}

export const PaginatedIssueCommentsContainer = createPaginationContainer(
  PaginatedIssueComments,
  {
    issueForPaginatedComments: graphql`fragment Post_issueForPaginatedComments on GitHubIssue @argumentDefinitions(count: {type: "Int", defaultValue: 10}, cursor: {type: "String"}) {
  id
  comments(first: $count, after: $cursor) @connection(key: "Post_issueForPaginatedComments_comments") {
    edges {
      node {
        ...Comment_fragment
      }
    }
  }
  oneGraphId
}`,
  },
  {
    direction: 'forward',
    getConnectionFromProps(props) {
      return props?.issueForPaginatedComments?.comments;
    },
    getVariables(props, pagination, fragmentVariables) {
      const {count, cursor} = pagination;
      return {...fragmentVariables, count: count, cursor: cursor, oneGraphId: props?.issueForPaginatedComments?.oneGraphId};
    },
    query: graphql`query Post_PaginatedIssueCommentsContainerQuery($oneGraphId: ID!, $count: Int = 10, $cursor: String) {
  oneGraphNode(oneGraphId: $oneGraphId) {
    oneGraphId
    ...Post_issueForPaginatedComments @arguments(count: $count, cursor: $cursor)
  }
}`
  }
);

export default function Post(props) {
  const data = useFragment(
    graphql`
      fragment Post_fragment on GitHubIssue {
        author {
          ...Author_fragment
        }
        bodyHTML
        id
        number
        title
        ...Post_issueForPaginatedComments @arguments
      }
    `,
    props.issue,
  );

  const authorUses = <Author  actor={data?.author} />;
  const paginatedIssueCommentsUses = <PaginatedIssueCommentsContainer  issueForPaginatedComments={data} />;

  return (
    <>
      <div className="data-box">
        <h3>Data for Post <LocationNote /></h3>
        <pre>{stringifyRelayData(data)}</pre>
        <h4>AuthorUses <LocationNote /></h4>
        {authorUses}
        <h4>PaginatedIssueCommentsUses <LocationNote /></h4>
        {paginatedIssueCommentsUses}
      </div>
    </>
  );
}

