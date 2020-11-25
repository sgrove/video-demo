
/* Author.js */
import React from 'react';
import graphql from 'babel-plugin-relay/macro';
import {useFragment} from 'react-relay/hooks';
import {stringifyRelayData, LocationNote} from './utils';


export default function Author(props) {
  const data = useFragment(
    graphql`
      fragment Author_fragment on GitHubActor {
        avatarUrl(size: 50)
        login
        url
      }
    `,
    props.actor,
  );

  

  return (
    <>
      <div className="data-box">
        <h3>Data for Author <LocationNote /></h3>
        <pre>{stringifyRelayData(data)}</pre>
        
      </div>
    </>
  );
}

