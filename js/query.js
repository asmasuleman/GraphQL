export async function dataQuery(token, query) {
  const url = "https://learn.reboot01.com/api/graphql-engine/v1/graphql"
  try {
    const rawResponse = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ query })
    });

    if (!rawResponse.ok) {
      throw new Error(`Network response was not ok: ${rawResponse.statusText}`);
    }

    const response = await rawResponse.json();

    if (response.errors) {
      throw new Error(`GraphQL errors: ${JSON.stringify(response.errors)}`);
    }

    return response;
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  }
}


export const loginQuery = (student) => `
  query {
    user(where: { id: { _eq: ${student.id} }}) {
		  login
      email
      id
      firstName
      lastName
      events (where:{event: {object: {name: {_eq: "Module"}}}}) {
        event {
          id
        }
      }
    }
  }
`

export const xpQuery = (student) => `
  query {
    user(where: { id: { _eq: ${student.id} }}) {
		auditRatio
    totalUp
    }
  }
`


export const projectTimelineXP = (student) => `
query XP_Project_History {
    user(where: { id: { _eq: ${student.id} }}) {
      transactions (
      order_by: [{ createdAt:  asc}]
      where:{
        type: { _eq: "xp"}
      _and: [
      {pathByPath: {path: { _nlike: "%checkpoint%" }}}
      {pathByPath: {path: { _nlike: "%piscine%" }}}]}) {
      amount
      type
      createdAt
      pathByPath {
        path
      }
      }
    }
  }
`

export const skills = (student) => `
  query {
    user(where: { id: { _eq: ${student.id} } }) {
      transactions(
        order_by: [{ type: desc }, { amount: desc }]
        distinct_on: [type]
        where: { 
          userId: { _eq: ${student.id} }
          type: { _like: "skill_%" }
        }
      ) { 
        type
        amount
      }
    }
  }
`