use git2::{DescribeFormatOptions, DescribeOptions, Repository};

fn main() {
    let Ok(repo) = Repository::open(".") else {
        return;
    };
    let Ok(git_describe_result) = repo
        .describe(
            DescribeOptions::new()
                .describe_tags()
                .show_commit_oid_as_fallback(true),
        )
        .and_then(|describe| {
            describe.format(Some(
                DescribeFormatOptions::new()
                    .always_use_long_format(true)
                    .dirty_suffix("-dirty"),
            ))
        })
    else {
        return;
    };
    println!("cargo::rustc-env=GIT_DESCRIBE={git_describe_result}")
}
