use git2::{DescribeFormatOptions, DescribeOptions, Error, Repository};

fn main() {
    let git_describe_result = match get_git_describe_result() {
        Ok(result) => println!("cargo::rustc-env=GIT_DESCRIBE={result}"),
        Err(e) => println!("cargo::warning={}", e),
    }
}

fn get_git_describe_result() -> Result<String, Error> {
    let repo = Repository::open(".")?;
    let describe = repo.describe(
        DescribeOptions::new()
            .describe_tags()
            .show_commit_oid_as_fallback(true),
    )?;
    let formatted = describe.format(Some(
        DescribeFormatOptions::new()
            .always_use_long_format(true)
            .dirty_suffix("-dirty"),
    ))?;
    Ok(formatted)
}
