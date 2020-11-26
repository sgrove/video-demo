/* Comment.js */
import React from "react";
import graphql from "babel-plugin-relay/macro";
import { useFragment } from "react-relay/hooks";
import { stringifyRelayData, LocationNote } from "./utils";
import Author2 from "./Author2";

export default function Comment(props) {
  const data = useFragment(
    graphql`
      fragment Comment_fragment on GitHubIssueComment {
        bodyHTML
        id
        url
        author {
          ...Author2_fragment
        }
      }
    `,
    props.comment
  );

  const author2Uses = <Author2 actor={data?.author} />;

  return (
    <>
      <div className="data-box">
        <h3>
          Data for Comment <LocationNote />
        </h3>
        <pre>{stringifyRelayData(data)}</pre>
        <h4>
          Author2Uses <LocationNote />
        </h4>
        {author2Uses}
      </div>
    </>
  );
}
