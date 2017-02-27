// @flow
import { Template } from 'meteor/templating'
import { TemplateVar } from 'meteor/frozeman:template-var'
import { dispatcher } from '/client/lib/action-dispatcher'
import TxQueue from '/client/lib/queue'
import { CompanyFactory, CompanyConfiguratorFactory } from '/client/lib/ethereum/contracts'

const tmpl = Template.Setup

tmpl.onCreated(() => {
  const initialTmpl = (window.injectMetaMask) ? 'Setup_MetaMask' : 'Setup_Welcome'
  TemplateVar.set('step', initialTmpl)
})

tmpl.onRendered(() => {
  $('#inboxButton, a[href="/account"]').hide()
  $('#pendingTxButton').popup({
    inline: true,
    on: 'click',
    position: 'bottom center',
  })
})

tmpl.events({
  'click #createOrganization': async () => {
    const companyFactory = await CompanyFactory.deployed()

    const par = dispatcher.transactionParams
    par.value = 1e17
    par.gas = 4.3e6
    console.log(par)
    console.log(companyFactory.address)
    const r = await companyFactory.deployCompany(par)
    console.log(1)
    const companyAddress = r.logs.filter(e => e.event === 'NewCompany')[0].args.companyAddress
    console.log(2)
    const companyConfiguratorFactory = await CompanyConfiguratorFactory.deployed()
    console.log(3, companyAddress)
    const txID = await dispatcher.performTransaction(companyConfiguratorFactory.configureCompany, companyAddress, par.from)
    console.log(4)
    console.log(txID)
    this.autorun(() => {
      const queue = TxQueue.queue.get()
      const txInQueue = queue.filter((tx) => {
        console.log(tx)
        return (tx.txID !== txID)
      })
      console.log(txInQueue)
    })
    localStorage.setItem('companyAddress', companyAddress)
    location.reload()
  },
  'click #joinOrganization': () => TemplateVar.set('step', 'Setup_JoinOrganization'),
})
