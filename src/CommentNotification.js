
/* CommentNotification.js */
import React, {useMemo} from 'react';
import graphql from 'babel-plugin-relay/macro';
import {useSubscription} from 'react-relay/hooks';
import {auth} from './Config';
import {suggestCORSSetup, LocationNote} from './utils';
import Comment from './Comment'

const COMMENT_NOTIFICATION_SUBSCRIPTION = graphql`
  subscription CommentNotification_CommentNotificationSubscription {
    github {
      issueCommentEvent(input: {repoOwner: "onegraph", repoName: "essay.dev"}) {
        comment {
          ...Comment_fragment
        }
      }
    }
  }`;

export default function CommentNotificationSubscription(props) {
  let [subscriptionResult, setSubscriptionResult] = React.useState(() => ({data: null, error: null}));

  const [subscriptionVariables, setSubscriptionVariables] = React.useState({...props});
  const [formVariables] = React.useState({...subscriptionVariables});
  const restartSubscription = () => { setSubscriptionResult({data: null, error: null}); setSubscriptionVariables({...formVariables})};

  const formEl = (
    <form onSubmit={event => { event.preventDefault(); restartSubscription(); }}>
      
      <input type="submit" />
    </form>
  );

  const subscriptionVariablesText = JSON.stringify(subscriptionVariables);

  // IMPORTANT: your config should be memoized, or at least not re-computed
  // every render. Otherwise, useSubscription will re-render too frequently.
  const subscriptionConfig = useMemo(
    () => ({
      variables: JSON.parse(subscriptionVariablesText),
      subscription: COMMENT_NOTIFICATION_SUBSCRIPTION,
      onError: (error) => {
        setSubscriptionResult((results) => { return {...results, error: error}; });
      },
      onNext: (data) => {
        setSubscriptionResult((results) => { return {...results, data: data}; });
      },
    }),
    [subscriptionVariablesText],
  );

  useSubscription(subscriptionConfig);

  const commentUses = <Comment  comment={subscriptionResult?.data?.github?.issueCommentEvent?.comment} />;

  const dataEl = subscriptionResult?.data ? (
    <div className="data-box">
      <h3>Data for CommentNotificationSubscription <LocationNote /></h3>

      <h4>CommentUses <LocationNote /></h4>
      {commentUses}
    </div>
  ) : (
    <div className="data-box">
      Waiting for data from CommentNotificationSubscription...
    </div>
  );

  const primaryError = subscriptionResult?.error?.source?.errors?.[0];

  const errorEl = primaryError ? (
    <div className="error-box">
      Error in CommentNotificationSubscription. <br />
      {suggestCORSSetup(primaryError)}
      <pre>
        {JSON.stringify(subscriptionResult?.error?.source?.errors, null, 2)}
      </pre>
    </div>
  ) : null;

  const needsLoginService = auth.findMissingAuthServices(subscriptionResult?.error?.source?.errors)[0];

  const actionButton = (
    <button
      className={!!needsLoginService ? 'login-hint' : null}
      onClick={async () => {
        if (!needsLoginService) {
          restartSubscription();
        } else {
          await auth.login(needsLoginService);
          const loginSuccess = await auth.isLoggedIn(needsLoginService);
          if (loginSuccess) {
            console.log('Successfully logged into ' + needsLoginService);
            setSubscriptionResult((results) => { return {...results, error: null}; });
            restartSubscription();
          } else {
            console.log('The user did not grant auth to ' + needsLoginService);
          }
        }
      }}>
      {needsLoginService ? 'Log in to ' + needsLoginService : 'Restart CommentNotificationSubscription'}
    </button>
  );

  return (
    <div>
      <h3>CommentNotificationSubscription <LocationNote /></h3>
      {formEl}
      {actionButton}
      {dataEl}
      {errorEl}
    </div>
  );
}
