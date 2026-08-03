# Page attachment listings in Celements and XWiki

The current Celements source contains three distinct page-attachment listing user interfaces. They are exposed through eight meaningful browser URL forms. Several URLs are aliases or wrappers around the same implementation.

In the examples below, `Space` and `Page` identify the target XWiki document.

## 1. Classic XWiki/Celements listing

The classic listing is implemented by `celements-webapp/src/main/webapp/templates/celTemplates/attachmentsinline.vm`. The standalone page and the Celements overlay both include this template, so they are different presentations of the same attachment listing.

Browser entry points:

- `/bin/view/Space/Page?xpage=attachments`
- `/bin/view/Space/Page?viewer=attachments`
- `/bin/view/Space/Page#Attachments`
- `/bin/view/Space/Page?xpage=overlay&conf=PageAttachments`
- `/bin/attach/Space/Page`

Notes:

- `?xpage=attachments` uses `templates/attachments.vm` as a standalone wrapper.
- `?viewer=attachments` selects `attachments.vm` through the standard XWiki view template.
- `#Attachments` opens the document-extra attachment tab when document extras are enabled. The tab loads the listing asynchronously.
- The `PageAttachments` overlay selects `celTemplates/attachmentsinline.vm` through `templates/celOverlay/PageAttachments.vm`.
- The `attach` action is mapped to `templates/attachments.vm` in `WEB-INF/struts-config.xml`.

The document-extra AJAX request can also address the HTML fragment directly:

```text
/bin/view/Space/Page?xpage=xpart&vm=attachmentsinline.vm
```

This is an internal rendering endpoint rather than a separate user interface.

## 2. Legacy Celements editor-tab listing

The old Celements editor has an independent attachment listing implemented by `celements-webapp/src/main/webapp/templates/celEditorTabs/loadTabAttachments.vm`.

Browser entry point:

```text
/bin/edit/Space/Page?tab=tb3
```

The attachment tab is included in the default tab configuration only when the page already has at least one attachment. Its content is loaded internally with a request equivalent to:

```text
xpage=celements_ajax&ajax_mode=CelTabContent&id=tb3
```

## 3. VueFinder page-attachments application

The modern listing is implemented by `celements-admin-frontend/src/views/PageAttachments.vue` and registered by `celements-admin-frontend/src/conf/routes/index.ts`.

Browser entry points:

- `/app/cel/admin/PageAttachments/Space/Page`
- `/bin/edit/Space/Page?editor=attachments`

The second URL renders `templates/editattachments.vm`, which redirects to the first URL.

The VueFinder application retrieves its listing from the Celements JSON endpoint:

```text
GET /api/attachments/Space/Page
```

The endpoint is implemented by `com.celements.filebase.PageAttachmentsController`. It also supplies the upload, delete, search, and download operations used by the application.

## Count summary

| Category | Count |
| --- | ---: |
| Distinct user-interface implementations | 3 |
| Meaningful browser URL forms | 8 |
| Classic listing URL forms | 5 |
| Legacy editor URL forms | 1 |
| VueFinder URL forms | 2 |

## Related listings not included in the count

- `?xpage=overlay&conf=FullAttRecycleBin` lists deleted attachments globally and is not a current-page attachment listing.
- Attachment history URLs such as the `viewattachrev` action list versions of one attachment rather than all attachments of a page.
- Upstream XWiki source defines a REST collection at `/rest/wikis/{wiki}/spaces/{space}/pages/{page}/attachments`. The current `celements-webapp` Maven configuration does not explicitly declare the XWiki REST server module, so availability of this endpoint in a deployed Celements installation must be verified separately.
