
/* Comment.js */
import React from 'react';
import graphql from 'babel-plugin-relay/macro';
import {useFragment} from 'react-relay/hooks';
import {stringifyRelayData, LocationNote} from './utils';
import Author from './Author'


export default function Comment(props) {
  const data = useFragment(
    graphql`
      fragment Comment_fragment on GitHubIssueComment {
        bodyHTML
        id
        url
        author {
          ...Author_fragment
        }
      }
    `,
    props.comment,
  );

  const authorUses = <Author  actor={data?.author} />;

  return (
    <>
      <div className="data-box">
        <h3>Data for Comment <LocationNote /></h3>
        <pre>{stringifyRelayData(data)}</pre>
        <h4>AuthorUses <LocationNote /></h4>
        {authorUses}
      </div>
    </>
  );
}

