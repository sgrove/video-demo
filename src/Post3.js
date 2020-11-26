/* Post3.js */
import React from "react";
import graphql from "babel-plugin-relay/macro";
import { useFragment } from "react-relay/hooks";
import { stringifyRelayData, LocationNote } from "./utils";
import { createPaginationContainer } from "react-relay";
import Comment from "./Comment";
import Author2 from "./Author2";

export function PaginatedIssueComments(props) {
  const { relay, issueForPaginatedComments } = props;
  const [isLoading, setIsLoading] = React.useState(false);

  const commentUses = issueForPaginatedComments?.comments?.edges?.map(
    (item, idx) => <Comment key={item?.node?.id || idx} comment={item?.node} />
  );

  const loadMoreCount = 2;

  return (
    <div>
      <h4>
        CommentUses <LocationNote />
      </h4>
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
        }}
      >
        {isLoading
          ? "Loading more comments..."
          : relay.hasMore()
          ? `Fetch ${loadMoreCount} more comments`
          : "All comments have been fetched"}
      </button>
    </div>
  );
}

export const PaginatedIssueCommentsContainer = createPaginationContainer(
  PaginatedIssueComments,
  {
    issueForPaginatedComments: graphql`
      fragment Post3_issueForPaginatedComments on GitHubIssue
      @argumentDefinitions(
        count: { type: "Int", defaultValue: 10 }
        cursor: { type: "String" }
      ) {
        id
        comments(first: $count, after: $cursor)
          @connection(key: "Post3_issueForPaginatedComments_comments") {
          edges {
            node {
              ...Comment_fragment
            }
          }
        }
        oneGraphId
      }
    `,
  },
  {
    direction: "forward",
    getConnectionFromProps(props) {
      return props?.issueForPaginatedComments?.comments;
    },
    getVariables(props, pagination, fragmentVariables) {
      const { count, cursor } = pagination;
      return {
        ...fragmentVariables,
        count: count,
        cursor: cursor,
        oneGraphId: props?.issueForPaginatedComments?.oneGraphId,
      };
    },
    query: graphql`
      query Post3_PaginatedIssueCommentsContainerQuery(
        $oneGraphId: ID!
        $count: Int = 10
        $cursor: String
      ) {
        oneGraphNode(oneGraphId: $oneGraphId) {
          oneGraphId
          ...Post3_issueForPaginatedComments
            @arguments(count: $count, cursor: $cursor)
        }
      }
    `,
  }
);

export default function Post3(props) {
  const data = useFragment(
    graphql`
      fragment Post3_fragment on GitHubIssue {
        author {
          ...Author2_fragment
        }
        bodyHTML
        id
        number
        title
        ...Post3_issueForPaginatedComments @arguments
      }
    `,
    props.issue
  );

  const author2Uses = <Author2 actor={data?.author} />;
  const paginatedIssueCommentsUses = (
    <PaginatedIssueCommentsContainer issueForPaginatedComments={data} />
  );

  return (
    <>
      <div className="data-box">
        <h3>
          Data for Post3 <LocationNote />
        </h3>
        <pre>{stringifyRelayData(data)}</pre>
        <h4>
          Author2Uses <LocationNote />
        </h4>
        {author2Uses}
        <h4>
          PaginatedIssueCommentsUses <LocationNote />
        </h4>
        {paginatedIssueCommentsUses}
      </div>
    </>
  );
}
