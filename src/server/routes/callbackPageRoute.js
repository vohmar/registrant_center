import dotenv from 'dotenv';
import request from 'request';
import jwt from 'jsonwebtoken';
import soapRequest from 'easy-soap-request';
import moment from 'moment';
import capitalize from 'capitalize';
import { publicKeyPem } from '../index';
import User from '../utils/UserSchema';

dotenv.config();

const { HOST, CLIENT_ID, CLIENT_SECRET, REDIRECT_URL, TOKEN_URL, ISSUER_URL, AR_URL, AR_USER, AR_PASS } = process.env;

const B64_VALUE = Buffer.from((`${CLIENT_ID}:${CLIENT_SECRET}`)).toString('base64');

const getCompanies = async (id, ident) => {
  const url = AR_URL;
  const headers = {
    'user-agent': 'sampleTest',
    'Content-Type': 'text/xml;charset=UTF-8',
    'soapAction': 'https://demo-ariregxmlv6.rik.ee/?wsdl',
  };
  const xml =
    `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xro="http://x-road.eu/xsd/xroad.xsd" xmlns:iden="http://x-road.eu/xsd/identifiers" xmlns:prod="http://arireg.x-road.eu/producer/">
      <soapenv:Body>
        <prod:detailandmed_v1>
          <prod:keha>
            <prod:ariregister_kasutajanimi>${AR_USER}</prod:ariregister_kasutajanimi>
            <prod:ariregister_parool>${AR_PASS}</prod:ariregister_parool>
            <prod:ariregister_valjundi_formaat>json</prod:ariregister_valjundi_formaat>
            <prod:fyysilise_isiku_kood>${ident}</prod:fyysilise_isiku_kood>
            <prod:yandmed>1</prod:yandmed>
            <prod:iandmed>0</prod:iandmed>
            <prod:kandmed>0</prod:kandmed>
            <prod:dandmed>0</prod:dandmed>
            <prod:maarused>0</prod:maarused>
          </prod:keha>
        </prod:detailandmed_v1>
      </soapenv:Body>
    </soapenv:Envelope>`;
  const { response } = await soapRequest(url, headers, xml);
  const { body } = response;
  if (body.keha.leitud_ettevotjate_arv > 0) {
    const companies = body.keha.ettevotjad.item.map(item => {
      return {
        'nimi': item.nimi,
        'ariregistri_kood': item.ariregistri_kood,
        'yldandmed': {
          'sidevahendid': item.yldandmed.sidevahendid.item,
          'aadressid': item.yldandmed.aadressid.item
        }
      };
    });
    User.updateOne({_id: id}, {
      companies,
      updated_at: Date.now(),
    }, () => {
      console.log('Updated user companies'); // eslint-disable-line no-console
    });
  } else {
    User.updateOne({_id: id}, {
      companies: [],
      updated_at: Date.now(),
    }, () => {
      console.log('Updated user companies'); // eslint-disable-line no-console
    });
  }
};

const setUserSession = (req, ident, firstName, lastName) => {
  req.session.user = {
    ident,
    first_name: firstName,
    last_name: lastName,
  };
};

const callbackPage = async (req, res) => {
  if (req.query.error) {
    console.log(' saadud veateade: ', req.query.error); // eslint-disable-line no-console
    return;
  }
  
  /* Võta päringu query-osast TARA poolt saadetud volituskood (authorization code) */
  const { code } = req.query;
  
  /*
   Turvaelemendi state kontroll
  */
  console.log('Turvaelemendi state kontroll'); // eslint-disable-line no-console
  const returnedState = req.query.state;
  const sessionState = req.session.grant.state;
  if (returnedState !== sessionState) {
    console.log('State ei ühti'); // eslint-disable-line no-console
    return;
  }
  request({
    uri: TOKEN_URL,
    method: 'POST',
    headers: {
      'Accept': 'application/json, application/xml, text/plain, text/html, *.*',
      'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
      'Authorization': `Basic ${B64_VALUE}`
    },
    form: {
      'grant_type': 'authorization_code',
      'code': code,
      'redirect_uri': REDIRECT_URL,
    }
  }, (error, response, body) => {
    const token = JSON.parse(body);
    const { id_token } = token; // eslint-disable-line camelcase
    /*
     Identsustõendi kontrollimine. Teegi jsonwebtoken
     abil kontrollitakse allkirja, tõendi saajat (aud), tõendi
     väljaandjat (iss) ja tõendi kehtivust (nbf ja exp).
     Vt https://www.npmjs.com/package/jsonwebtoken
    */
    console.log('--- Identsustõendi kontrollimine:'); // eslint-disable-line no-console
    // remove the cookie
    res.clearCookie('connect.sid', {
      domain: HOST,
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/'
    });
    
    jwt.verify(
      id_token, // Kontrollitav tõend
      publicKeyPem[0], // Allkirja avalik võti
      {
        audience: CLIENT_ID, // Tõendi saaja
        issuer: ISSUER_URL, // Tõendi väljaandja
        clockTolerance: 10 // Kellade max lubatud erinevus
      }, (err, verifiedJwt) => {
        if (err) {
          console.log(' ebaedukas'); // eslint-disable-line no-console
          console.log(err); // eslint-disable-line no-console
          res.redirect('/login');
        } else {
          const userData = {
            ident: verifiedJwt.sub.replace(/\D/g,''),
            first_name: capitalize.words(verifiedJwt.profile_attributes.given_name),
            last_name: capitalize.words(verifiedJwt.profile_attributes.family_name),
          };
          User.findOne({
            ident: userData.ident
          }).then(async user => {
            if (user) {
              const today = moment(Date.now());
              const updatedAt = moment(user.updated_at);
              if (today.diff(updatedAt, 'days') > 1) {
                /*
                let compIdent;
                if (userData.ident === '39211101518') {
                  compIdent = '37806280271';
                  getCompanies(user._id, compIdent);
                } else {
                  getCompanies(user._id, user.ident);
                }
                */
                await getCompanies(user._id, user.ident);
              }
              
              User.updateOne({_id: user._id}, {
                ident: userData.ident,
                first_name: userData.first_name,
                last_name: userData.last_name,
                updated_at: Date.now(),
                visited_at: Date.now()
              }, () => {
                setUserSession(req, userData.ident, userData.first_name, userData.last_name);
                res.redirect('/');
              });
            } else {
              new User({
                ident: userData.ident,
                first_name: userData.first_name,
                last_name: userData.last_name,
                created_at: Date.now(),
                visited_at: Date.now()
              }).save()
                .then(async newUser => {
                  setUserSession(req, userData.ident, userData.first_name, userData.last_name);
                  await getCompanies(newUser._id, newUser.ident);
                  res.redirect('/');
                });
            }
          });
        }
      }
    );
  });
};

export default callbackPage;