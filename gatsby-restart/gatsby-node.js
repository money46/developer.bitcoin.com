/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/node-apis/
 */

const path = require(`path`)
const { createFilePath } = require(`gatsby-source-filesystem`)

// Allow webpack to work with absolute paths
exports.onCreateWebpackConfig = ({
  stage,
  rules,
  loaders,
  plugins,
  actions,
}) => {
  actions.setWebpackConfig({
    resolve: {
      modules: [path.resolve(__dirname, 'src'), 'node_modules'],
    },
  })
}


// Generate GraphQL Schema
exports.onCreateNode = ({ node, getNode, actions }) => {
  const { createNodeField } = actions

  // Deal with markdown files
  if (node.internal.type === `MarkdownRemark`) {

    const filePath = createFilePath({ node, getNode })

    const filename= filePath.split('/').slice(-2, -1)


    // Split by type;
    const isDoc = filePath.includes(`/docs/`)
    let slug = filePath;

    if(isDoc) {
      let product = 'misc';

      const isBitbox = filePath.includes('/bitbox/')
      const isWormhole = filePath.includes('/wormhole/')

      if(isBitbox) {
        slug = `/bitbox/docs/${filename}`
        product = 'bitbox'
      }
      if(isWormhole) {
        slug = `/wormhole/docs/${filename}`
        product = 'wormhole'
      }

      createNodeField({
        node,
        name: `slug`,
        value: slug,
      })
      createNodeField({
        node,
        name: `type`,
        value: 'docs',
      })
      createNodeField({
        node,
        name: `product`,
        value: product,
      })


    }
  }
}


exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions

  // Query graphQL data
  const result = await graphql(`
    {
      docs: allMarkdownRemark(
        filter: { fields: { type: { eq: "docs" } } }
      ) {
        edges {
          node {
            fields {
              slug
            }
          }
        }
      }
    }
  `)
  const docs = result.data.docs.edges

  docs.forEach(({ node }) => {
    createPage({
      path: node.fields.slug,
      component: path.resolve(`./src/templates/docPage.js`),
      context: {
        slug: node.fields.slug,
      },
    })
  })
}