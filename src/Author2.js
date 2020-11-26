/* Author2.js */
import React from "react";
import graphql from "babel-plugin-relay/macro";
import { useFragment } from "react-relay/hooks";
import { stringifyRelayData, LocationNote } from "./utils";

export default function Author2(props) {
  const data = useFragment(
    graphql`
      fragment Author2_fragment on GitHubActor {
        avatarUrl(size: 50)
        login
        url
      }
    `,
    props.actor
  );

  return (
    <>
      <div className="data-box">
        <h3>
          Data for Author2 <LocationNote />
        </h3>
        <pre>{stringifyRelayData(data)}</pre>
      </div>
    </>
  );
}
