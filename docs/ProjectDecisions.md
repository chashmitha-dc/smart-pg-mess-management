# Project Decisions

## Decision 001

Student table renamed to Member.

Reason:

A PG contains students, employees, workers and professionals.

Using "Member" makes the software generic.

---

## Decision 002

Billing cycle is member-based.

Reason:

Each member joins on different dates.

Monthly billing would not work.

---

## Decision 003

Support multiple payment methods.

Reason:

Some members pay cash while others pay online.

One bill can have multiple payments.

---

## Decision 004

Dynamic meal pricing.

Reason:

Every PG has different meal prices.