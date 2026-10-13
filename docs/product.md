# FlowMS product guide

FlowMS is an interior-design CRM for studios that issue Revit drawings. It holds one record from the first brief to the last invoice: the inquiry, the client, the stage of work, the sheets, the client’s approval, the message log, and the fee.

It is built for a design studio, not a generic sales team. Property type, style, square footage, sheet numbers, and client sign-off are part of the record.

The public site is the home page. The working tool is the studio.

## Who it is for

A principal or studio manager who currently keeps briefs in one inbox, drawings in another, and fees in a spreadsheet. FlowMS replaces that split with a single workspace the studio opens every day.

The client does not get a separate login. The studio opens a client portal preview and walks the client through progress and sheets, or uses that view as the client-facing screen.

## Why a studio uses it

A lead is not a drawing, and a drawing is not an invoice, but they belong to the same client. The mess in a small studio is that those records live in different places.

FlowMS follows the sequence the work already has:

1. A brief arrives.
2. The studio qualifies it or archives it.
3. A fit becomes a client and a project.
4. The project moves through design, BIM, procurement, site, and handover.
5. Sheets are issued and the client approves them or asks for changes.
6. The studio bills a retainer or a milestone against the same client.
7. Analysis shows what is open, what is unpaid, and how much drafting time the sheets have already saved.

## How a project moves

| Step | What happens | Where it lives |
| --- | --- | --- |
| Inquiry | A brief arrives with a name, a property, a budget, a source, and a note. | Inquiries |
| Qualify | The studio marks it New, Qualified, or Archived. | Inquiries |
| Convert | A fit becomes a client. A project opens in Lead Inbound. The brief is kept as the client notes. | Inquiries, then the client record |
| Design | The stage moves as concept becomes a BIM set. | Pipeline and the client record |
| Sheets | Lighting, plumbing, elevations, renders, models, and material schedules are tracked, with a status the client can approve. | Deliverables |
| Approval | The client reviews sheets in the portal and approves or requests changes. | Client portal |
| Message | The studio drafts an update and keeps it on the project log. | Messages |
| Invoice | A retainer or milestone is issued and later marked paid or overdue. | Invoices and the client record |
| Review | Pipeline value, open briefs, unpaid fees, and hours saved sit on one screen. | Analysis |

Converting an inquiry also writes an activity line: the inquiry was converted, and from which source. Changing a stage, issuing an invoice, and changing an invoice status each write their own line. Those lines show on the client record.

## The two places in the product

### Home

The home page introduces FlowMS. It states what the product is, why a studio would use it, the ten tools inside, and the five-step path from inquiry to invoice. Light and dark theme can be set here. **Open studio** enters the workspace.

### Studio

The studio is the daily workspace. It opens on Analysis.

The sidebar lists every tool. Pipeline shows how many clients are on the books. Inquiries shows how many briefs are still open (New or Qualified). On a narrow screen the same tools sit in a horizontal bar.

**Add client** is available from every studio screen. A new client always opens a project. The form captures name, company, email, phone, address, city, property type, style, budget, square footage, starting stage, lead source, and notes. Name and email are required.

A footer line tells the studio whether the record is saved in this browser or connected to a shared database.

## Studio vocabulary

These lists are the language of the product. Filters, forms, and the pipeline all use them.

**Property types.** Luxury Villa, Penthouse, Commercial Office, Boutique Retail, Modern Apartment, Hospitality & Lounge.

**Design styles.** Warm Minimalist, Contemporary Japandi, Mid-Century Modern, Biophilic Luxury, Urban Industrial, Neo-Classical, Art Deco Modern.

**Lead sources.** Referral, Instagram, Architect Partner, Website, Houzz.

**Budget bands** used when filtering the pipeline. Under $150k, $150k–$400k, $400k–$800k, $800k and above.

**Inquiry statuses.** New, Qualified, Converted, Archived.

**Sheet statuses.** Draft, Pending Review, Approved, Changes Requested.

**Invoice statuses.** Pending, Paid, Overdue.

**Sheet types.** Lighting Plan, Plumbing Plan, Elevation, 3D Photorealistic Render, Revit BIM Model, Material Schedule.

## The eight stages

Every client sits in one stage. The pipeline board is these eight columns. Analysis charts the same stages.

| Stage | What it means in the studio |
| --- | --- |
| Lead Inbound | New client. The brief is still open. Converted inquiries land here. |
| Consultation & Discovery | Site visit and scope. |
| Concept & Moodboard | Direction and materials. |
| Schematic Planning | Plans and partitions. |
| Revit BIM & Tech Drawings | Sheets and the model. |
| Procurement & Specs | Furniture, fixtures, equipment, and finishes. |
| Execution & Site Build | The build is in progress. |
| Handover & Reveal | Styled and signed off. |

Moving a client updates the project stage and writes an activity line that names the stage they left and the stage they entered.

## Features

### Analysis

The opening screen. It answers “where does the studio stand?” without a separate report.

Four figures, each of which opens the related tool:

- **Pipeline value.** The sum of client budgets, with the client count beside it. Opens the pipeline.
- **Open inquiries.** Briefs that are New or Qualified, with the total brief count beside it. Opens the inbox.
- **Outstanding.** Pending and overdue fees, with the amount already collected beside it. Opens invoices.
- **Hours saved.** Drafting time recorded against automated sheets. Opens deliverables.

Below that, a stage chart shows how many clients sit in each stage and the budget those clients represent. An invoice summary splits Paid, Pending, and Overdue by count and amount. A short list shows the four most recent inquiries, with property, source, budget, and status.

### Inquiries

The holding area for a brief before it is a client.

A new inquiry needs a name and email, and can include phone, property type, budget, lead source, and the brief itself. New inquiries start as New.

The inbox can be searched by name, email, or brief, and filtered by status and source. Each row shows the person, the property, the budget, the source, the date, and the status.

From a row the studio can:

- Change the status to New, Qualified, or Archived.
- **Convert to client** when the brief is a fit.

Convert copies the name, email, phone, property, budget, source, and brief onto a new client. The project opens in Lead Inbound. Style starts as Warm Minimalist, and the address is left to be confirmed on the client record. The inquiry is marked Converted and can no longer be converted again. The client record opens immediately so the studio can fill in what the brief did not include.

### Pipeline

The board of current clients, one column per stage.

The studio can search by client and narrow the board by stage, property type, style, lead source, and budget band. The board shows how many clients match the current view. An empty stage reads as none in that stage.

Each card shows the client, the property context, and the budget. From a card the studio can:

- Change the stage without leaving the board.
- Open the client record.
- Jump to Messages for that client.
- Open that client’s portal.

### Client record

The single page for one client. It opens from a pipeline card and after an inquiry is converted.

It shows property type, name, company or city, budget, square footage, style, and source, plus email, phone, and address.

From the record the studio can:

- Move the stage.
- Open the portal or start a message.
- Write and save notes. Notes from a converted inquiry are already here.
- See every sheet on the project, with its sheet number and approval status.
- See every invoice, with number, description, amount, and status.
- Read the activity on that client: stage moves, the conversion, invoices, and messages, each with channel and date.

### Deliverables

The sheet register for the studio.

The header states how many hours the sheets already in the studio have saved. The list can be filtered to all sheets, lighting plans, plumbing plans, elevations, or 3D renders. A count of approved sheets and sheets still in review sits beside the filter.

**Generate sheet** records a new automated sheet on a project. The studio chooses the project, the sheet type, and the space (a master suite, a kitchen island, a dining pavilion). The sheet is stored with a sheet number, a draft status, a note that it was produced by the automation, and the drafting time it replaced. That time is what Analysis reports as hours saved.

The studio can also review a sheet in place: set it to Draft, Pending Review, Approved, or Changes Requested, and keep the client’s note on the sheet. The same status is what the client sees in the portal and what shows on the client record.

### Client portal

A preview of the project as the client would see it. The studio picks the client from the pipeline or the client record. If no client exists yet, the portal asks the studio to add one.

The client view shows:

- Property type, style, project name, address, target handover, and the Revit version on the project.
- Overall progress and the current stage.
- The list of architectural sheets on that project.
- A sheet reviewer with optional notes.

The client can approve a sheet, or request changes. A change request needs a note. Both actions update the sheet status in the studio, so Deliverables and the client record stay in step. The studio can return to the pipeline from the preview bar.

### Messages

A draft-and-log tool for client updates. It is a studio record. It does not send a live WhatsApp message and it is not connected to WhatsApp Business.

The studio picks a client and a template, edits the text, and logs the send. The phone preview shows the message as the client would read it. Logged messages appear in the history for that studio, and on the client’s activity.

Templates cover the updates a studio actually sends:

- A plan sheet is ready for review.
- A milestone phase is complete.
- A sign-off is needed before fabrication.
- A site inspection and progress note.

The template fills in the client’s name and property. The log keeps the channel, the trigger, the text, and the time.

### Spec studio

Turns a room brief into lighting, plumbing, and millwork notes the studio can paste into a Revit schedule. It does not write into the Revit file itself.

The studio sets the room, the style direction, the area, and the brief (cove lighting, a freestanding tub, a zero-threshold shower, and similar). **Generate** asks the studio’s language model for a structured schedule: photometric lighting, plumbing rough-in heights and fixtures, and joinery finish codes.

The result can be copied or downloaded as a FlowMS specification PDF. If generation is unavailable, a sample specification for the same kind of room is still there to copy or export, so a demo or a review is not blocked.

### Studio Chat

A studio assistant that answers from the records already in the workspace. It can be asked about any client or project.

Each answer is grounded in the current snapshot: clients, projects, sheets, invoices, inquiries, and activity. It can report a person’s project, stage, budget, amount spent, progress, target date, invoice, sheet, and notes.

Answers are shown as a name and then labeled facts, so a principal can read them the way they would read a client card. The conversation stays in the session. Chat does not create clients, move stages, or issue invoices.

### Invoices

Retainers and milestone fees, tied to a client and that client’s project.

The top of the screen shows three totals: invoiced, collected, and outstanding. The list can be searched by client or invoice number and filtered by Paid, Pending, or Overdue.

**New invoice** picks a client, a description, an amount, and a due date. If that client does not yet have a project, one is created so the fee is never orphaned. The invoice number is assigned by the studio. Issuing the invoice writes an activity line.

Status is changed on the row: Pending, Paid, or Overdue. The new status is written to the activity log and appears on the client record and in Analysis.

## Flows the studio actually runs

### A brief becomes a paying client

1. A brief arrives by referral, Instagram, an architect partner, the website, or Houzz.
2. The studio logs it under Inquiries, or it is already in the inbox.
3. Search and filters find it. Status moves from New to Qualified, or to Archived if it is not a fit.
4. Convert to client. The pipeline gains a card in Lead Inbound. The client record opens with the brief in the notes.
5. The studio completes address, style, square footage, and company on the record.
6. As the work proceeds, the stage moves on the card or on the record. Each move is logged.
7. Sheets are generated or added, then sent for review.
8. The studio opens the portal, the client approves or requests changes, and the sheet status updates.
9. A message is drafted from a template and kept on the log.
10. A retainer or milestone invoice is issued. When it is paid or becomes overdue, the status is updated. Analysis reflects the new outstanding and collected totals.

### A principal checks the studio on Monday

1. Open the studio. Analysis is the first screen.
2. Read pipeline value, open inquiries, outstanding fees, and hours saved.
3. Open the stage chart to see where work is stuck.
4. Open an overdue or pending total to land on Invoices.
5. Open a recent inquiry if a brief still needs a decision.
6. Ask Studio Chat for a specific client: stage, budget, open invoice, and the latest sheet.

### A sheet goes out for sign-off

1. In Deliverables, generate a sheet for the project and the room, or open an existing sheet.
2. Set the status to Pending Review.
3. From the pipeline, open that client’s portal.
4. The client approves, or writes a note and requests changes.
5. The sheet, the client record, and the hours-saved figure all reflect the outcome.
6. If the client needs a nudge, open Messages, use the sign-off template, and keep the draft on the log.

### A fee is billed against a milestone

1. Open Invoices and issue a new invoice for the client, with a description such as a concept retainer or a BIM milestone, an amount, and a due date.
2. The invoice appears in the totals, on the client record, and as an activity line.
3. When payment arrives, mark it Paid. Collected goes up and outstanding goes down on both Invoices and Analysis.
4. If the due date passes unpaid, mark it Overdue. Analysis counts it in outstanding, and the invoice summary splits it out.

## What the product deliberately does not do

These boundaries keep the product honest in a sales or onboarding conversation.

- Messages are a studio log and a draft. They are not a live WhatsApp or WhatsApp Business connection.
- The client portal is a preview the studio opens. Clients do not have their own accounts.
- Spec studio produces notes and a PDF for a Revit schedule. It does not push parameters into a Revit file.
- Studio Chat reads the studio. It does not edit records.
- There is no multi-user login, shared calendar, or email campaign tool.
- Generating a sheet records the deliverable and the time saved. It does not produce a Revit file.

## How the record is kept

Until a shared database is connected, the studio is saved in the browser that opened it. The sidebar says so. The first time that browser opens an empty studio, a sample practice is already there so the tools can be walked with real clients, sheets, inquiries, and invoices.

When a shared database is connected, the same screens read and write that database, and the sidebar says the studio is connected.

Studio Chat and Spec studio use a language model configured on the server. There is no API key field in the product. If the server is not configured, Chat says it is unavailable, and Spec studio still offers the sample specification to copy or download.
