## Travis tests have failed

Hey @{{pullRequestAuthor}},
Please click the following black triangle (&#9654;) in order to see the detailed information.
It'll be awesome if you fix what's wrong and commit the changes.

{{#jobs}}

### {{displayName}}

{{#scripts}}

<details>
  <summary>
    <strong>
     Detailed Information
    </strong>
  </summary>

```
{{&contents}}
```

</details>

{{/scripts}}
{{/jobs}}
