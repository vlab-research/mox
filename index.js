// https://m.me/testvirtuallab?ref=form.LDfNCy
const uuid = require('uuid');
const PAGE_ID = '935593143497601';

const {translator, addCustomType} = require('@vlab-research/translate-typeform')
const fs = require('fs')

function getFields(path) {
  const form = JSON.parse(fs.readFileSync(path, 'utf-8'))
  return form.fields.map(addCustomType).map(translator)
}

function makeReferral(userId, formId, time=Date.now(), pageId=PAGE_ID) {
  return {
    id: uuid(),
    time: time,
    messaging:[
      { recipient: { id: pageId },
        timestamp: Date.now(),
        sender: { id: userId },
        referral: {
          ref: `form.${formId}`,
          source: 'SHORTLINK',
          type: 'OPEN_THREAD' } } ]
  }
}

function _baseMessage(userId, extra, time=Date.now(), pageId=PAGE_ID) {
  return {
    id: uuid(),
    time,
    messaging: [{
      sender: { id: userId } ,
      recipient: { id: pageId },
      timestamp: time,
      ...extra
    }]
  }
}

function makeEcho(message, userId, time=Date.now(), pageId=PAGE_ID) {
  const extra =  {
    sender: { id: pageId } ,
    recipient: { id: userId },
    message: {
      is_echo: true,
      metadata: message.metadata,
      text: message.text || message.attachment.payload.text,
    }
  }

  return _baseMessage(userId, extra, time)
}

function makePostback(message, userId, idx, time=Date.now(), pageId=PAGE_ID) {

  const button = message.attachment.payload.buttons[idx]
  const postback = {payload: button.payload, title: button.title }

  return _baseMessage(userId, {postback}, time, pageId)
}

function makeQR(message, userId, idx, time=Date.now(), pageId=PAGE_ID) {
  const payload = message.quick_replies[idx].payload
  const qr = { quick_reply: { payload }}
  return _baseMessage(userId, { message: qr }, time, pageId)
}

function makeTextResponse(userId, text, time=Date.now(), pageId=PAGE_ID) {
  return _baseMessage(userId, { message: { text }}, time, pageId)
}

function makeSynthetic(userId, event, pageId=PAGE_ID) {
  return {
    user: userId,
    source: 'synthetic',
    page: pageId,
    event
  }
}

function makeNotify(userId, payload, time=Date.now(), pageId=PAGE_ID) {
  const extra = {
    optin: {
      type: 'one_time_notif_req',
      payload: payload,
      one_time_notif_token: 'FOOBAR'
    }
  }
  return _baseMessage(userId, extra, time, pageId)
}

module.exports = {
  makeReferral,
  makeEcho,
  makePostback,
  makeQR,
  makeTextResponse,
  getFields,
  makeSynthetic,
  makeNotify,
  _baseMessage,
  PAGE_ID
}
