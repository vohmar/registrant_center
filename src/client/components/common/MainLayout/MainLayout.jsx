import React from 'react';
import { Icon } from 'semantic-ui-react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useHistory } from 'react-router-dom';
import { Helmet } from 'react-helmet';

import MainFooter from '../MainFooter/MainFooter';
import MainHeader from '../MainHeader/MainHeader';

const MainLayout = ({
  children,
  hasBackButton,
  heroKey,
  heroValues,
  htmlTitleKey,
  htmlTitleValues,
  title,
  titleValues,
  titleKey,
  ui,
  user
}) => {
  const { goBack } = useHistory();
  const { formatMessage } = useIntl();
  return (
    <React.Fragment>
      <Helmet title={title || formatMessage({ id: htmlTitleKey || titleKey }, {
        ...htmlTitleValues,
        ...titleValues
      }) + formatMessage({ id: 'head.title' })} />
      <MainHeader ui={ui} user={user} />
      <main className="main-layout">
        <div className="main-hero">
          {title && <h1>{title}</h1>}
          {titleKey && (
            <FormattedMessage id={titleKey} values={titleValues} tagName="h1" />
          )}
          {heroKey && (
            <FormattedMessage
              id={heroKey}
              tagName='p'
              values={heroValues}
            />
          )}
          {hasBackButton && (
            <button type='button' className='back-link' onClick={goBack}>
              <Icon name='arrow left' />
              <FormattedMessage id='hero.link.back'/>
            </button>
          )}
        </div>
        {children}
      </main>
      <MainFooter ui={ui} />
    </React.Fragment>
  );
};

export default MainLayout;

