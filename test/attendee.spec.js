import { describe, it, expect, beforeEach } from 'vitest'
import { useRegistrationWizard } from '@/composables/useRegistrationWizard'

describe('attendee validation', () => {
  let wizard

  beforeEach(() => {
    wizard = useRegistrationWizard()
    wizard.resetWizardState()
  })

  describe('required text fields validation', () => {
    const requiredTextFields = [
      ['fullName', 'John Doe', 'Full name is required'],
      ['company', 'Acme Inc.', 'Company is required'],
      ['jobTitle', 'Software Engineer', 'Job title is required'],
    ]

    it.each(requiredTextFields)(
      'sets required message if %s is empty',
      (field, _validValue, requiredMsg) => {
        wizard.attendee[field] = ''
        wizard.validateAttendee()
        expect(wizard.attendeeErrorMsgs[field]).toEqual({ required: requiredMsg, format: '' })
      }
    )

    it.each(requiredTextFields)(
      'sets required message if %s contains only spaces',
      (field, _validValue, requiredMsg) => {
        wizard.attendee[field] = '   '
        wizard.validateAttendee()
        expect(wizard.attendeeErrorMsgs[field]).toEqual({ required: requiredMsg, format: '' })
      }
    )

    it.each(requiredTextFields)('clears required message if %s is valid', (field, validValue) => {
      wizard.attendee[field] = ''
      wizard.validateAttendee()
      wizard.attendee[field] = validValue
      wizard.validateAttendee()
      expect(wizard.attendeeErrorMsgs[field]).toEqual({ required: '', format: '' })
    })
  })

  describe('Email validation', () => {
    it('sets required messages if Email is empty', () => {
      wizard.attendee.email = ''
      wizard.validateAttendee()
      expect(wizard.attendeeErrorMsgs.email).toEqual({
        required: 'Email is required',
        format: '',
      })
    })

    it('sets required messages if Email contains only spaces', () => {
      wizard.attendee.email = '   '
      wizard.validateAttendee()
      expect(wizard.attendeeErrorMsgs.email).toEqual({
        required: 'Email is required',
        format: '',
      })
    })

    it('sets format error messages if Email is invalid', () => {
      wizard.attendee.email = 'john.doe@example'
      wizard.validateAttendee()
      expect(wizard.attendeeErrorMsgs.email).toEqual({ required: '', format: 'Email is invalid' })
    })

    it('clears error messages if Email is valid', () => {
      wizard.attendee.email = ''
      wizard.validateAttendee()
      wizard.attendee.email = 'john.doe@example.com'
      wizard.validateAttendee()
      expect(wizard.attendeeErrorMsgs.email).toEqual({ required: '', format: '' })
    })
  })

  describe('Phone validation', () => {
    it('sets required messages if Phone is empty', () => {
      wizard.attendee.phone = ''
      wizard.validateAttendee()
      expect(wizard.attendeeErrorMsgs.phone).toEqual({
        required: 'Phone number is required',
        format: '',
      })
    })

    it('sets required messages if Phone contains only spaces', () => {
      wizard.attendee.phone = '   '
      wizard.validateAttendee()
      expect(wizard.attendeeErrorMsgs.phone).toEqual({
        required: 'Phone number is required',
        format: '',
      })
    })

    it('sets format error messages if Phone is too short', () => {
      wizard.attendee.phone = '12345'
      wizard.validateAttendee()
      expect(wizard.attendeeErrorMsgs.phone).toEqual({
        required: '',
        format: 'Phone number is invalid',
      })
    })

    it('sets format error messages if Phone is too long', () => {
      wizard.attendee.phone = '123456789012345678901234567890'
      wizard.validateAttendee()
      expect(wizard.attendeeErrorMsgs.phone).toEqual({
        required: '',
        format: 'Phone number is invalid',
      })
    })

    it('sets format error messages if Phone contains invalid characters', () => {
      wizard.attendee.phone = '1234567890a'
      wizard.validateAttendee()
      expect(wizard.attendeeErrorMsgs.phone).toEqual({
        required: '',
        format: 'Phone number is invalid',
      })
    })

    it('clears error messages if Phone is valid', () => {
      wizard.attendee.phone = ''
      wizard.validateAttendee()
      wizard.attendee.phone = '1234567890'
      wizard.validateAttendee()
      expect(wizard.attendeeErrorMsgs.phone).toEqual({ required: '', format: '' })
    })

    it.each(['+886 987-654-321', '+886 0987-654-321', '(02)2364-4567'])(
      'accepts formatted phone numbers: %s',
      (phone) => {
        wizard.attendee.phone = phone
        wizard.validateAttendee()
        expect(wizard.attendeeErrorMsgs.phone).toEqual({ required: '', format: '' })
      }
    )
  })
})
