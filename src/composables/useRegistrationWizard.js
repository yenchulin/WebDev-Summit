import { computed, reactive, ref } from 'vue'
import { event } from '@/mocks/event'
import { sessions } from '@/mocks/sessions'
import { addons } from '@/mocks/addons'
import moment from 'moment'
import { CATEGORIES } from '@/utils/constants'

/** attendee info */
const attendee = reactive({
  fullName: '',
  email: '',
  phone: '',
  company: '',
  jobTitle: '',
  shippingAddress: '',
})
const attendeeErrorMsgs = reactive({
  fullName: { required: '', format: '' },
  email: { required: '', format: '' },
  phone: { required: '', format: '' },
  company: { required: '', format: '' },
  jobTitle: { required: '', format: '' },
  shippingAddress: { required: '', format: '' },
})

const isFullNameValid = computed(() => attendee.fullName.trim() !== '')
const isEmailRequired = computed(() => attendee.email.trim() !== '')
const isEmailFormatValid = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(attendee.email.trim()))
const isPhoneRequired = computed(() => attendee.phone.trim() !== '')
const isPhoneFormatValid = computed(() =>
  /^(?=(?:\D*\d){10,15}\D*$)\+?[\d\s\-()]+$/.test(attendee.phone.trim())
)
const isCompanyValid = computed(() => attendee.company.trim() !== '')
const isJobTitleValid = computed(() => attendee.jobTitle.trim() !== '')
const isShippingAddressValid = computed(() =>
  isShippingRequired.value ? attendee.shippingAddress.trim() !== '' : true
)
const isAttendeeValid = computed(() =>
  Object.values(attendeeErrorMsgs).every((error) => error.required === '' && error.format === '')
)

function validateAttendee() {
  attendeeErrorMsgs.fullName.required = isFullNameValid.value ? '' : 'Full name is required'
  attendeeErrorMsgs.email.required = isEmailRequired.value ? '' : 'Email is required'
  attendeeErrorMsgs.email.format =
    isEmailRequired.value && !isEmailFormatValid.value ? 'Email is invalid' : ''
  attendeeErrorMsgs.phone.required = isPhoneRequired.value ? '' : 'Phone number is required'
  attendeeErrorMsgs.phone.format =
    isPhoneRequired.value && !isPhoneFormatValid.value ? 'Phone number is invalid' : ''
  attendeeErrorMsgs.company.required = isCompanyValid.value ? '' : 'Company is required'
  attendeeErrorMsgs.jobTitle.required = isJobTitleValid.value ? '' : 'Job title is required'
  attendeeErrorMsgs.shippingAddress.required = isShippingAddressValid.value
    ? ''
    : 'Shipping address is required for merchandise orders'
}

function resetAttendee() {
  attendee.fullName = ''
  attendee.email = ''
  attendee.phone = ''
  attendee.company = ''
  attendee.jobTitle = ''
  attendee.shippingAddress = ''
}

function resetAttendeeErrorMsgs() {
  for (const field in attendeeErrorMsgs) {
    attendeeErrorMsgs[field] = { required: '', format: '' }
  }
}

/** ticket selection */
const selectedTicketTypeId = ref(event.ticketTypes[0]?.id ?? '')
const ticketTypes = computed(() => event.ticketTypes ?? [])
const selectedTicket = computed(() =>
  ticketTypes.value.find((ticket) => ticket.id === selectedTicketTypeId.value)
)
const ticketPrice = computed(() => selectedTicket.value?.price ?? 0)

function selectTicketType(ticketTypeId) {
  selectedTicketTypeId.value = ticketTypeId
}

function resetTicketSelection() {
  selectedTicketTypeId.value = ticketTypes.value[0]?.id ?? ''
}

/** session selection */
const selectedSessionIds = ref(new Set([]))
const selectedSessionErrorMsg = ref('')
const eventDates = computed(() => event.dates ?? [])
const sessionsById = computed(() =>
  Object.fromEntries(sessions.map((session) => [session.id, session]))
)
const sessionsByDay = computed(() => {
  const grouped = {}
  sessions
    .toSorted((a, b) => moment(a.date).diff(moment(b.date)))
    .forEach((s) => {
      const dayKey = moment(s.date).format('YYYY-MM-DD')
      if (grouped[dayKey]) {
        grouped[dayKey].push(s)
      } else {
        grouped[dayKey] = [s]
      }
    })
  return grouped
})
const selectedSessionDateRanges = computed(() => {
  return Array.from(selectedSessionIds.value).map((sessionId) => {
    const session = sessionsById.value[sessionId]
    return {
      date: moment(session.date),
      endDate: moment(session.endDate),
    }
  })
})
const selectedSessions = computed(() => {
  return Array.from(selectedSessionIds.value).map((sessionId) => {
    return sessionsById.value[sessionId]
  })
})
const isSelectedSessionsValid = computed(() => selectedSessionErrorMsg.value === '')

function toggleSession(sessionId) {
  if (selectedSessionIds.value.has(sessionId)) {
    selectedSessionIds.value.delete(sessionId)
  } else {
    selectedSessionIds.value.add(sessionId)
  }
}

function validateSelectedSessions() {
  const sortedDateRanges = selectedSessionDateRanges.value.toSorted((a, b) => a.date.diff(b.date))
  for (let i = 0; i < sortedDateRanges.length - 1; i++) {
    const current = sortedDateRanges[i]
    const next = sortedDateRanges[i + 1]
    if (current.endDate.isAfter(next.date)) {
      selectedSessionErrorMsg.value = 'Selected sessions have time conflicts'
      return
    }
  }
  selectedSessionErrorMsg.value = ''
}

function resetSessionSelection() {
  selectedSessionIds.value = new Set([])
}

function resetSelectedSessionErrorMsg() {
  selectedSessionErrorMsg.value = ''
}

/** addons selection */
const addonSelectionState = reactive(
  Object.fromEntries(
    addons.map((addon) => [
      addon.id,
      {
        quantity: 0,
        size: addon.sizes?.[0] ?? '',
      },
    ])
  )
)
const addonsById = computed(() => Object.fromEntries(addons.map((a) => [a.id, a])))
const addonsByCategory = computed(() => {
  const grouped = {}
  addons.forEach((a) => {
    if (grouped[a.category]) {
      grouped[a.category].push(a)
    } else {
      grouped[a.category] = [a]
    }
  })
  return grouped
})
const selectedAddons = computed(() =>
  Object.entries(addonSelectionState).reduce((acc, [id, selection]) => {
    if (selection.quantity > 0) {
      acc.push({
        ...addonsById.value[id],
        ...selection,
      })
    }
    return acc
  }, [])
)
const workshopVipDiscount = computed(() => {
  if (selectedTicket.value?.id === 'vip') {
    return selectedAddons.value.reduce((sum, addon) => {
      if (addon.category === CATEGORIES.workshop.id) {
        return sum + addon.price * addon.quantity * 0.1
      }
      return sum
    }, 0)
  }
  return 0
})
const isShippingRequired = computed(() =>
  selectedAddons.value.some((addon) => addon.category === CATEGORIES.merchandise.id)
)
const addonsPrice = computed(() =>
  selectedAddons.value.reduce((sum, addon) => sum + addon.price * addon.quantity, 0)
)

function toggleAddon(addonId) {
  if (addonSelectionState[addonId].quantity > 0) {
    addonSelectionState[addonId].quantity = 0
  } else {
    addonSelectionState[addonId].quantity = 1
  }
}

function increaseAddonQuantity(addonId) {
  const addon = addonsById.value[addonId]
  if (!addon || (addon.maxQuantity ?? 1) <= addonSelectionState[addonId].quantity) return
  addonSelectionState[addonId].quantity += 1
}

function decreaseAddonQuantity(addonId) {
  const addon = addonsById.value[addonId]
  if (!addon || addonSelectionState[addonId].quantity <= 0) return
  addonSelectionState[addonId].quantity -= 1
}

function updateAddonSize(addonId, size) {
  const addon = addonsById.value[addonId]
  if (!addon || !addon.sizes?.includes(size)) return
  addonSelectionState[addonId].size = size
}

function resetAddonSelection() {
  Object.keys(addonSelectionState).forEach((addonId) => {
    addonSelectionState[addonId].quantity = 0
    addonSelectionState[addonId].size = addonsById.value[addonId].sizes?.[0] ?? ''
  })
}

/** general */
const totalPrice = computed(() =>
  Math.max(ticketPrice.value + addonsPrice.value - workshopVipDiscount.value, 0)
)

function resetWizardState() {
  resetAttendee()
  resetAttendeeErrorMsgs()
  resetTicketSelection()
  resetSessionSelection()
  resetSelectedSessionErrorMsg()
  resetAddonSelection()
}

/** submission state */
const isSubmissionLoading = ref(false)

async function submitRegistration() {
  validateAttendee()
  validateSelectedSessions()
  if (!isAttendeeValid.value || !isSelectedSessionsValid.value) return null

  isSubmissionLoading.value = true
  try {
    await new Promise((resolve) => setTimeout(resolve, 1500))
    return { success: true, confirmationCode: '47291' }
  } catch (e) {
    return { success: false, error: 'Failed to submit registration. Please try again.' }
  } finally {
    isSubmissionLoading.value = false
  }
}

export function useRegistrationWizard() {
  return {
    /** attendee info */
    attendee,
    attendeeErrorMsgs,
    isAttendeeValid,
    validateAttendee,
    /** ticket selection */
    ticketTypes,
    selectedTicketTypeId,
    selectedTicket,
    ticketPrice,
    selectTicketType,
    /** session selection */
    selectedSessionIds,
    selectedSessionErrorMsg,
    eventDates,
    sessionsByDay,
    selectedSessions,
    selectedSessionDateRanges,
    isSelectedSessionsValid,
    toggleSession,
    validateSelectedSessions,
    /** addons selection */
    addonsByCategory,
    addonSelectionState,
    selectedAddons,
    workshopVipDiscount,
    isShippingRequired,
    toggleAddon,
    increaseAddonQuantity,
    decreaseAddonQuantity,
    updateAddonSize,
    /** general */
    resetWizardState,
    totalPrice,
    /** submission state */
    isSubmissionLoading,
    submitRegistration,
  }
}
