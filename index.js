// https://m.me/testvirtuallab?ref=form.LDfNCy
const uuid = require('uuid');
const PAGE_ID = '935593143497601';

const {translator, addCustomType} = require('@vlab-research/translate-typeform')
const fs = require('fs')

function getFields(path) {
  const form = JSON.parse(fs.readFileSync(path, 'utf-8'))
  return form.fields.map(addCustomType).map(translator)
}

function makeReferral(userId, formId) {
  return {
    id: uuid(),
    time: Date.now(),
    messaging:[
      { recipient: { id: PAGE_ID },
        timestamp: Date.now(),
        sender: { id: userId },
        referral: {
          ref: `form.${formId}`,
          source: 'SHORTLINK',
          type: 'OPEN_THREAD' } } ]
  }
}

function _baseMessage(userId, extra, time=Date.now()) {
  return {
    id: uuid(),
    time,
    messaging: [{
      sender: { id: userId } ,
      recipient: { id: PAGE_ID },
      timestamp: time,
      ...extra
    }]
  }
}

function makeEcho(message, userId, time=Date.now()) {
  const extra =  {
    sender: { id: PAGE_ID } ,
    recipient: { id: userId },
    message: {
      is_echo: true,
      metadata: message.metadata,
      text: message.text || message.attachment.payload.text,
    }
  }

  return _baseMessage(userId, extra, time)
}

function makePostback(message, userId, idx) {

  const button = message.attachment.payload.buttons[idx]
  const postback = {payload: button.payload, title: button.title }

  return _baseMessage(userId, {postback})
}

function makeQR(message, userId, idx) {
  const payload = message.quick_replies[idx].payload
  const qr = { quick_reply: { payload }}
  return _baseMessage(userId, { message: qr })
}

function makeTextResponse(userId, text) {
  return _baseMessage(userId, { message: { text }})
}

function makeSynthetic(userId, event) {
  return {
    user: userId,
    source: 'synthetic',
    page: PAGE_ID,
    event
  }
}

function makeNotify(userId, payload) {
  const extra = {
    optin: {
      type: 'one_time_notif_req',
      payload: payload,
      one_time_notif_token: 'FOOBAR'
    }
  }
  return _baseMessage(userId, extra)
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
