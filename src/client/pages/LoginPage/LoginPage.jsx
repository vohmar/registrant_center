import React from 'react';
import { FormattedMessage} from 'react-intl';
import { connect } from 'react-redux';
import { Button, Container, Icon, Form } from 'semantic-ui-react';

import {MainLayout, MessageModule} from '../../components';

function LoginPage({ user, ui }) {
  const message = {
    code: user.status > 0 ? user.status : null,
    type: 'logout'
  };

  return (
    <MainLayout heroKey="login.hero.text" titleKey="login.title" ui={ui} user={user}>
      { message.code && <MessageModule message={message} /> }
      <div className="page page--login">
        <div className='u-container'>
          <Container text textAlign='center' className='page--login--area'>
            <FormattedMessage
              id='login.content.title'
              tagName='h3'
            />
            <FormattedMessage
              id='login.content.text'
              tagName='p'
            />
            <div className="login-options">
              <div className="login-options--item">
                <Icon name='id card' size='big' />
                <FormattedMessage
                  id='login.options.idCard'
                  tagName='p'
                />
              </div>
              <div className="login-options--item">
                <Icon name='mobile alternate' size='big' />
                <FormattedMessage
                  id='login.options.mobileId'
                  tagName='p'
                />
              </div>
              <div className="login-options--item">
                <Icon name='lock' size='big' />
                <FormattedMessage
                  id='login.options.eidas'
                  tagName='p'
                />
              </div>
              <div className="login-options--item">
                <Icon name='mobile alternate' size='big' />
                <FormattedMessage
                  id='login.options.smartId'
                  tagName='p'
                />
              </div>
            </div>
            <Form action="/connect/openid">
              <Button primary type='submit' size={ui.uiElemSize}>
                <FormattedMessage
                  id='actions.login'
                  tagName='span'
                />
              </Button>
            </Form>
          </Container>
        </div>
      </div>
    </MainLayout>
  );
}

const mapStateToProps = ({ ui, user }) => ({
  ui,
  user: user.data,
});

export default connect(mapStateToProps)(LoginPage);
